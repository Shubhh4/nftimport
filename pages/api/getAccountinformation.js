import { ethers } from 'ethers'
const fromWei = (num) => ethers.utils.formatEther(num)

const erc721Abi = [
  'function balanceOf(address owner) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function supportsInterface(bytes4 interfaceId) view returns (bool)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function owner() view returns (address)',
]

export default async function handler(req, res) {
  const { address } = req.query

  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_APP_RPC_URL)
    const contract = new ethers.Contract(address, erc721Abi, provider)

    const accountInfo = { address }

    try {
      const supportsERC721 = await contract.supportsInterface('0x80ac58cd')
      accountInfo.type = supportsERC721 ? 'ERC721 Token Contract' : 'Non-ERC721 Contract'
      accountInfo.isContract = supportsERC721

      if (supportsERC721) {
        accountInfo.name = await contract.name()
        accountInfo.symbol = await contract.symbol()
        accountInfo.totalSupply = (await contract.totalSupply()).toString()
        accountInfo.balance = fromWei(await provider.getBalance(address))
      }
    } catch (error) {
      console.log('supportsERC721 Error:', error)
      accountInfo.type = 'Non-ERC721 Contract'
      accountInfo.isContract = false
      accountInfo.balance = fromWei(await provider.getBalance(address))
    }

    res.status(200).json(accountInfo)
  } catch (error) {
    console.log('Error: ', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
