export type InstructionEventType = "invoke" | "success" | "failed" | "log" | "compute";

export interface InstructionEvent {
  type: InstructionEventType;
  message: string;
  raw: string;
  computeUnitsConsumed?: number;
  computeUnitsLimit?: number;
}

export interface ParsedInstructionNode {
  id: number;
  depth: number;
  programId: string;
  programName: string;
  decodedInstruction?: string;
  status: "success" | "failed" | "unknown";
  computeUnitsConsumed?: number;
  computeUnitsLimit?: number;
  events: InstructionEvent[];
  children: ParsedInstructionNode[];
}

const PROGRAM_NAME_MAP: Record<string, string> = {
  "11111111111111111111111111111111": "System Program",
  ComputeBudget111111111111111111111111111111: "Compute Budget Program",
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: "SPL Token Program",
  ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL: "Associated Token Program",
  MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr: "Memo Program",
  Stake11111111111111111111111111111111111111: "Stake Program",
  Vote111111111111111111111111111111111111111: "Vote Program",
  BPFLoaderUpgradeab1e11111111111111111111111: "BPF Upgradeable Loader",
};

export class TransactionDebuggerEngine {
  static parseInstructions(logs: string[] = []): ParsedInstructionNode[] {
    try {
      const roots: ParsedInstructionNode[] = [];
      const activeByDepth: Array<ParsedInstructionNode | undefined> = [];
      let nextId = 1;

      const invokeRegex = /^Program\s+(\S+)\s+invoke\s+\[(\d+)\]$/;
      const successRegex = /^Program\s+(\S+)\s+success$/;
      const failedRegex = /^Program\s+(\S+)\s+failed:\s+(.+)$/;
      const consumedRegex = /^Program\s+(\S+)\s+consumed\s+(\d+)\s+of\s+(\d+)\s+compute\s+units$/;
      const programLogRegex = /^Program\s+log:\s+(.+)$/;

      const trimActiveToDepth = (depth: number) => {
        activeByDepth.length = depth + 1;
      };

      const findActiveNode = (programId: string): ParsedInstructionNode | undefined => {
        for (let depth = activeByDepth.length - 1; depth >= 1; depth -= 1) {
          const node = activeByDepth[depth];
          if (node?.programId === programId) {
            return node;
          }
        }
        return undefined;
      };

      const getCurrentNode = (): ParsedInstructionNode | undefined => {
        for (let depth = activeByDepth.length - 1; depth >= 1; depth -= 1) {
          const node = activeByDepth[depth];
          if (node) {
            return node;
          }
        }
        return undefined;
      };

      for (const rawLine of logs) {
        const line = rawLine.trim();

        const invokeMatch = line.match(invokeRegex);
        if (invokeMatch) {
          const [, programId, depthRaw] = invokeMatch;
          const depth = Number(depthRaw);
          const node: ParsedInstructionNode = {
            id: nextId,
            depth,
            programId,
            programName: this.decodeProgramName(programId),
            status: "unknown",
            events: [
              {
                type: "invoke",
                message: `invoke [${depth}]`,
                raw: line,
              },
            ],
            children: [],
          };
          nextId += 1;

          const parent = activeByDepth[depth - 1];
          if (parent) {
            parent.children.push(node);
          } else {
            roots.push(node);
          }

          activeByDepth[depth] = node;
          trimActiveToDepth(depth);
          continue;
        }

        const consumedMatch = line.match(consumedRegex);
        if (consumedMatch) {
          const [, programId, consumedRaw, limitRaw] = consumedMatch;
          const node = findActiveNode(programId);
          if (node) {
            const consumed = Number(consumedRaw);
            const limit = Number(limitRaw);
            node.computeUnitsConsumed = consumed;
            node.computeUnitsLimit = limit;
            node.events.push({
              type: "compute",
              message: `consumed ${consumed.toLocaleString()} of ${limit.toLocaleString()} CU`,
              raw: line,
              computeUnitsConsumed: consumed,
              computeUnitsLimit: limit,
            });
          }
          continue;
        }

        const successMatch = line.match(successRegex);
        if (successMatch) {
          const [, programId] = successMatch;
          const node = findActiveNode(programId);
          if (node) {
            node.status = "success";
            node.events.push({
              type: "success",
              message: "success",
              raw: line,
            });
            activeByDepth[node.depth] = undefined;
            trimActiveToDepth(node.depth - 1);
          }
          continue;
        }

        const failedMatch = line.match(failedRegex);
        if (failedMatch) {
          const [, programId, reason] = failedMatch;
          const node = findActiveNode(programId);
          if (node) {
            node.status = "failed";
            node.events.push({
              type: "failed",
              message: `failed: ${reason}`,
              raw: line,
            });
            activeByDepth[node.depth] = undefined;
            trimActiveToDepth(node.depth - 1);
          }
          continue;
        }

        const logMatch = line.match(programLogRegex);
        if (logMatch) {
          const [, message] = logMatch;
          const node = getCurrentNode();
          if (node) {
            const instructionName = this.parseInstructionFromProgramLog(message);
            if (instructionName && !node.decodedInstruction) {
              node.decodedInstruction = instructionName;
            }
            node.events.push({
              type: "log",
              message,
              raw: line,
            });
          }
          continue;
        }

        const node = getCurrentNode();
        if (node) {
          node.events.push({
            type: "log",
            message: line,
            raw: line,
          });
        }
      }

      return roots;
    } catch (error) {
      console.error("Error parsing transaction logs:", error);
      return [];
    }
  }

  static formatInstructionTitle(node: ParsedInstructionNode, index: number): string {
    const baseLabel = this.getInstructionLabel(node);
    return `Instruction #${index + 1}: ${baseLabel}`;
  }

  static getInstructionLabel(node: ParsedInstructionNode): string {
    const cleanedProgramName = node.programName.replace(/\s+Program$/i, "");
    if (node.decodedInstruction) {
      return `${cleanedProgramName} ${node.decodedInstruction}`;
    }
    return cleanedProgramName;
  }

  private static decodeProgramName(programId: string): string {
    return PROGRAM_NAME_MAP[programId] ?? this.shortProgramId(programId);
  }

  private static parseInstructionFromProgramLog(message: string): string | undefined {
    const match = message.match(/^Instruction:\s*(.+)$/i);
    return match ? match[1].trim() : undefined;
  }

  private static shortProgramId(programId: string): string {
    if (programId.length <= 12) {
      return programId;
    }
    return `${programId.slice(0, 4)}...${programId.slice(-4)}`;
  }
}