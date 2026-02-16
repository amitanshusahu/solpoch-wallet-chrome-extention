export MY_WALLET_NAME='Solpoch'
export MY_WALLET_CLASS_NAME='Solpoch'
export MY_WALLET_VARIABLE_NAME='solpoch'
export MY_WALLET_PACKAGE_NAME='solpoch'

mv ghost $MY_WALLET_PACKAGE_NAME
cd $MY_WALLET_PACKAGE_NAME

find . -name "package.json" -type f -exec sed -i "s/@solana\/wallet-standard-ghost/${MY_WALLET_PACKAGE_NAME}-standard-wallet/g" {} +
find src -type f -exec sed -i "s/'Ghost'/'${MY_WALLET_NAME}'/g" {} +
find src -type f -exec sed -i "s/Ghost/${MY_WALLET_CLASS_NAME}/g" {} +
find src -type f -exec sed -i "s/ghost/${MY_WALLET_VARIABLE_NAME}/g" {} +