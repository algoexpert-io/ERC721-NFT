const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;

const tokenAbi = [
  "constructor(string tokenName, string symbol)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function approve(address to, uint256 tokenId)",
  "function balanceOf(address owner) view returns (uint256)",
  "function baseURI() view returns (string)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function mintToken(address owner, string metadataURI) returns (uint256)",
  "function name() view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes _data)",
  "function setApprovalForAll(address operator, bool approved)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  "function symbol() view returns (string)",
  "function tokenByIndex(uint256 index) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function transferFrom(address from, address to, uint256 tokenId)",
];

const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
let tokenContract = null;

async function getAccess() {
  if (tokenContract) return;
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
}

async function getAllNFTs() {
  await getAccess();
  const numNFTs = await tokenContract.balanceOf(await signer.getAddress());
  document.getElementById("numNfts").innerHTML = numNFTs;

  const nfts = [];
  let promises = [];
  for (let idx = 0; idx < numNFTs; idx++) {
    const promise = tokenContract.tokenByIndex(idx).then((nftId) => {
      const id = nftId.toNumber();
      return tokenContract.tokenURI(id).then((uri) => nfts.push(uri));
    });
    promises.push(promise);
  }
  await Promise.all(promises);

  promises = [];
  const div = document.getElementById("nfts");
  for (const nft of nfts) {
    const link = getUrl(nft);
    const promise = fetch(link)
      .then((data) => data.json())
      .then((json) => {
        const nftDiv = document.createElement("div");

        const img = document.createElement("img");
        img.src = getUrl(json.image);
        img.width = 200;
        nftDiv.appendChild(img);

        const name = document.createElement("p");
        const text = document.createTextNode(json.name);
        name.append(text);
        nftDiv.appendChild(name);

        const description = document.createElement("p");
        const text2 = document.createTextNode(json.description);
        name.append(text2);
        nftDiv.appendChild(description);

        div.appendChild(nftDiv);
      });
    promises.push(promise);
  }
  await Promise.all(promises);
}

function getUrl(ipfs) {
  return "http://localhost:8080/ipfs" + ipfs.split(":")[1].slice(1);
}
