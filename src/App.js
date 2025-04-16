import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button, TextField, Typography, Box, Paper, Snackbar, Alert, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';

const CONTRACT_ADDRESS = "0x7D701429Ae7D761FeF36EAFA6273e7aEE373A82B";
const RPC_URL = "https://node-2.seismicdev.net/rpc";
const SEISMIC_CHAIN_ID = "5124";
const DEPLOYER_ADDRESS = "0xCA01CC8979574cF0a719372C9BAa3457E40e68df";
const BACKEND_URL = "https://treasure-hunt-frontend-livid.vercel.app";
const CHAT_BACKEND_URL = "https://treasure-hunt-backend-93cc.onrender.com";

const ABI = [
  "function treasureCount() view returns (uint256)",
  "function getTreasure(uint256) view returns (bytes32, address, bool, uint256, string)",
  "function claimTreasure(uint256, string) external",
  "function getPoints(address) view returns (uint256)",
  "function getTreasuresClaimed(address) view returns (uint256)",
  "function getAllScores() view returns (address[] memory, uint256[] memory, uint256[] memory)",
  "function addTreasure(bytes32 clueHash, uint256 points, string hint) external",
  "function updateHint(uint256 id, string newHint) external"
];

// Styled Components
const FullScreenBox = styled(Box)({
  width: "100vw",
  height: "100vh",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "row",
  backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')",
  backgroundColor: "#deb887",
  backgroundSize: "cover",
  backgroundPosition: "center",
  overflow: "hidden",
  boxSizing: "border-box",
});

const ParchmentPaper = styled(Paper)({
  backgroundImage: "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
  backgroundColor: "#f4e4bc",
  padding: "20px",
  border: "5px solid #8b4513",
  borderRadius: "10px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
  width: "100%",
  boxSizing: "border-box",
});

const WoodenButton = styled(Button)({
  backgroundColor: "#8b4513",
  color: "#ffd700",
  fontFamily: "'Pirata One', cursive",
  fontSize: "16px",
  padding: "10px 20px",
  '&:hover': { backgroundColor: "#a0522d" },
});

const DiscordLabel = styled(Typography)({
  backgroundColor: "#8b4513",
  color: "#ffd700",
  fontFamily: "'Pirata One', cursive",
  fontSize: "16px",
  padding: "10px 20px",
  borderRadius: "4px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
});

const GoldTypography = styled(Typography)({
  color: "#ffd700",
  fontFamily: "'Pirata One', cursive",
  textShadow: "1px 1px 2px #8b4513",
});

const TreasureInput = styled(TextField)({
  '& .MuiInputBase-root': {
    backgroundColor: "#fff8dc",
    border: "2px solid #8b4513",
    fontFamily: "'Pirata One', cursive",
  },
  '& .MuiInputLabel-root': { color: "#8b4513" },
});

const ChatBox = styled(Box)({
  backgroundColor: "#f4e4bc",
  border: "2px solid #8b4513",
  padding: "10px",
  flex: "1 1 auto",
  overflowY: "auto",
  marginTop: "20px",
  display: "flex",
  flexDirection: "column",
  width: "100%",
  boxSizing: "border-box",
});

const TreasureChestSpinner = styled(Box)({
  width: "100px",
  height: "100px",
  backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')",
  backgroundColor: "#8b4513",
  border: "3px solid #ffd700",
  borderRadius: "10px",
  margin: "20px auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  animation: "spin 3s linear infinite",
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" }
  },
  "&::before": {
    content: '"💰"',
    fontSize: "50px",
  }
});

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [treasures, setTreasures] = useState([]);
  const [points, setPoints] = useState(0);
  const [treasuresClaimed, setTreasuresClaimed] = useState(0);
  const [solutions, setSolutions] = useState({});
  const [message, setMessage] = useState({ open: false, text: "", severity: "info" });
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const [discordLink, setDiscordLink] = useState({});
  const [newClue, setNewClue] = useState("");
  const [newPoints, setNewPoints] = useState("");
  const [newHint, setNewHint] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [page, setPage] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hintUpdates, setHintUpdates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 20;

  const fetchChatMessages = async () => {
    try {
      console.log("Fetching chat messages from:", `${CHAT_BACKEND_URL}/api/chat`);
      const response = await fetch(`${CHAT_BACKEND_URL}/api/chat`);
      console.log("Response status:", response.status);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const messages = await response.json();
      console.log("Fetched messages:", messages);
      setChatMessages(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      setMessage({ open: true, text: "Failed to load chat messages!", severity: "error" });
    }
  };

  useEffect(() => {
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDiscordId = async (address) => {
    try {
      console.log("Fetching Discord ID for address:", address);
      const response = await fetch(`${BACKEND_URL}/discord/${address}`);
      console.log("Response status:", response.status);
      if (!response.ok) {
        if (response.status === 404) {
          console.log("No Discord ID linked for this address, skipping error display.");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched Discord data:", data);
      setDiscordLink(prev => ({ ...prev, [address]: data.discordId }));
    } catch (error) {
      console.error("Error fetching Discord ID:", error.message);
      setMessage({ open: true, text: `Failed to fetch Discord ID: ${error.message}`, severity: "error" });
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        setProvider(provider);
        setContract(contract);

        if (window.ethereum) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await web3Provider.listAccounts();
          if (accounts.length > 0) {
            const signer = await web3Provider.getSigner();
            const address = await signer.getAddress();
            setSigner(signer);
            setContract(new ethers.Contract(CONTRACT_ADDRESS, ABI, signer));
            setUserAddress(address);
            setIsConnected(true);
            const points = await contract.getPoints(address);
            const treasures = await contract.getTreasuresClaimed(address);
            setPoints(points.toString());
            setTreasuresClaimed(treasures.toString());

            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            if (code && state && state === address) {
              console.log("Detected Discord callback with code:", code, "and state:", state);
              await fetchDiscordId(address);
              window.history.replaceState({}, document.title, window.location.pathname);
            } else {
              await fetchDiscordId(address);
            }
          }
        }

        await Promise.all([
          refreshTreasures(contract),
          updateLeaderboard(contract)
        ]);
      } catch (error) {
        console.error("Initialization error:", error);
        setMessage({ open: true, text: "Failed to initialize—check blockchain or backend!", severity: "error" });
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const refreshTreasures = async (contractInstance) => {
    try {
      const count = await contractInstance.treasureCount();
      const treasureList = [];
      for (let i = 0; i < count; i++) {
        const [clueHash, claimant, isClaimed, points, hint] = await contractInstance.getTreasure(i);
        treasureList.push({ id: i, clueHash, claimant, isClaimed, points: points.toString(), hint });
      }
      setTreasures(treasureList);
    } catch (error) {
      console.error("Refresh treasures error:", error);
    }
  };

  const updateLeaderboard = async (contractInstance) => {
    try {
      const [addresses, pointsList, treasuresList] = await contractInstance.getAllScores();
      const sorted = addresses.map((addr, i) => ({
        address: addr,
        points: pointsList[i].toString(),
        treasures: treasuresList[i].toString()
      })).sort((a, b) => Number(b.points) - Number(a.points));

      const discordIds = {};
      for (const user of sorted) {
        if (!discordIds[user.address]) {
          try {
            const response = await fetch(`${BACKEND_URL}/discord/${user.address}`);
            if (response.ok) {
              const data = await response.json();
              if (data.discordId) {
                discordIds[user.address] = data.discordId;
              }
            }
          } catch (error) {
            console.error(`Error fetching Discord ID for ${user.address}:`, error);
          }
        }
      }
      setDiscordLink(prev => ({ ...prev, ...discordIds }));
      setLeaderboard(sorted);
    } catch (e) {
      console.error("Leaderboard fetch error:", e);
    }
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const connectWallet = async () => {
    if (!window.ethereum) {
      setMessage({ open: true, text: "Install MetaMask or Rabby, matey!", severity: "error" });
      return;
    }

    try {
      setMessage({ open: true, text: "Connecting to the high seas...", severity: "info" });
      let provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const network = await provider.getNetwork();
      const currentChainId = network.chainId.toString();

      if (currentChainId !== SEISMIC_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${parseInt(SEISMIC_CHAIN_ID).toString(16)}` }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            setMessage({ open: true, text: "Adding Seismic Chain Devnet to MetaMask...", severity: "info" });
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: `0x${parseInt(SEISMIC_CHAIN_ID).toString(16)}`,
                chainName: "Seismic Chain Devnet",
                rpcUrls: [RPC_URL],
                nativeCurrency: { name: "Seismic ETH", symbol: "sETH", decimals: 18 },
                blockExplorerUrls: ["https://explorer-2.seismicdev.net"]
              }],
            });
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${parseInt(SEISMIC_CHAIN_ID).toString(16)}` }],
            });
          } else {
            throw switchError;
          }
        }
        await delay(1000);
        provider = new ethers.BrowserProvider(window.ethereum);
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setSigner(signer);
      setContract(new ethers.Contract(CONTRACT_ADDRESS, ABI, signer));
      setUserAddress(address);
      const points = await contract.getPoints(address);
      const treasures = await contract.getTreasuresClaimed(address);
      setPoints(points.toString());
      setTreasuresClaimed(treasures.toString());
      await refreshTreasures(contract);
      await updateLeaderboard(contract);

      // Fetch the Discord ID for the address
      await fetchDiscordId(address);

      setMessage({ open: true, text: "Connected, ye pirate!", severity: "success" });
      setIsConnected(true);
    } catch (error) {
      console.error("Wallet connection error:", error);
      setMessage({ open: true, text: `Failed to connect: ${error.message}`, severity: "error" });
    }
  };

  const disconnectWallet = () => {
    setSigner(null);
    setContract(new ethers.Contract(CONTRACT_ADDRESS, ABI, provider));
    setPoints(0);
    setTreasuresClaimed(0);
    setUserAddress(null);
    setIsConnected(false);
    // Do not clear discordLink; let it persist
    setMessage({ open: true, text: "Disconnected, back to shore!", severity: "info" });
  };

  const claim = async (id) => {
    if (!signer) return setMessage({ open: true, text: "Connect wallet first!", severity: "error" });
    if (!discordLink[userAddress]) return setMessage({ open: true, text: "Link Discord first to claim booty!", severity: "error" });
    if (!solutions[id]) return setMessage({ open: true, text: "Enter a solution!", severity: "error" });

    try {
      setMessage({ open: true, text: `Submitting treasure claim #${id}...`, severity: "info" });
      const tx = await contract.claimTreasure(id, solutions[id]);
      await tx.wait();
      const newPoints = await contract.getPoints(userAddress);
      const newTreasures = await contract.getTreasuresClaimed(userAddress);
      setPoints(newPoints.toString());
      setTreasuresClaimed(newTreasures.toString());
      setTreasures(prev => prev.map(t => t.id === id ? { ...t, isClaimed: true, claimant: userAddress } : t));
      await updateLeaderboard(contract);
      setMessage({ open: true, text: "Treasure claimed!", severity: "success" });
    } catch (error) {
      console.error("Claim error:", error);
      let errorMessage = "Failed to submit solution";
      if (error.code === "CALL_EXCEPTION" && error.reason === "Wrong solution") {
        errorMessage = "Wrong solution";
      } else if (error.error && error.error.message && error.error.message.includes("Wrong solution")) {
        errorMessage = "Wrong solution";
      } else if (error.message && error.message.includes("Wrong solution")) {
        errorMessage = "Wrong solution";
      }
      setMessage({ open: true, text: errorMessage, severity: "error" });
    }
  };

  const linkDiscord = async () => {
    if (!isConnected) return setMessage({ open: true, text: "Connect wallet first!", severity: "error" });
    if (discordLink[userAddress]) return setMessage({ open: true, text: "Already linked!", severity: "warning" });
    const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${process.env.REACT_APP_DISCORD_CLIENT_ID || ''}&redirect_uri=${encodeURIComponent(BACKEND_URL + '/discord/callback')}&response_type=code&scope=identify&state=${userAddress}`;
    window.location.href = discordAuthUrl;
  };

  const forgiveUser = async (address) => {
    if (!isConnected || userAddress?.toLowerCase() !== DEPLOYER_ADDRESS.toLowerCase()) return setMessage({ open: true, text: "Only deployer can pardon!", severity: "error" });
    try {
      const response = await fetch(`${BACKEND_URL}/discord/forgive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address })
      });
      if (response.ok) {
        setDiscordLink(prev => {
          const newLinks = { ...prev };
          delete newLinks[address];
          return newLinks;
        });
        setMessage({ open: true, text: `User ${address} forgiven!`, severity: "success" });
      } else {
        throw new Error("Failed to forgive user");
      }
    } catch (error) {
      setMessage({ open: true, text: `Failed: ${error.message}`, severity: "error" });
    }
  };

  const addTreasure = async () => {
    if (!signer || userAddress?.toLowerCase() !== DEPLOYER_ADDRESS.toLowerCase()) return setMessage({ open: true, text: "Only deployer can add treasures!", severity: "error" });
    if (!newClue || !newPoints || !newHint) return setMessage({ open: true, text: "Enter all fields!", severity: "error" });

    try {
      const lowerClue = newClue.toLowerCase();
      const clueHash = ethers.keccak256(ethers.toUtf8Bytes(lowerClue));
      const pointsValue = parseInt(newPoints);
      if (isNaN(pointsValue) || pointsValue <= 0) throw new Error("Points must be positive");
      const tx = await contract.addTreasure(clueHash, pointsValue, newHint);
      await tx.wait();
      await refreshTreasures(contract);
      setNewClue("");
      setNewPoints("");
      setNewHint("");
      setMessage({ open: true, text: `Treasure added with ${pointsValue} points!`, severity: "success" });
    } catch (error) {
      console.error("Add treasure error:", error);
      setMessage({ open: true, text: `Failed: ${error.message}`, severity: "error" });
    }
  };

  const updateHint = async (id) => {
    if (!signer || userAddress?.toLowerCase() !== DEPLOYER_ADDRESS.toLowerCase()) return setMessage({ open: true, text: "Only deployer can update hints!", severity: "error" });
    const newHintValue = hintUpdates[id];
    if (!newHintValue) return setMessage({ open: true, text: "Enter a new hint!", severity: "error" });

    try {
      const tx = await contract.updateHint(id, newHintValue);
      await tx.wait();
      setTreasures(prev => prev.map(t => t.id === id ? { ...t, hint: newHintValue } : t));
      setHintUpdates(prev => ({ ...prev, [id]: "" }));
      setMessage({ open: true, text: `Hint for treasure #${id} updated!`, severity: "success" });
    } catch (error) {
      console.error("Update hint error:", error);
      setMessage({ open: true, text: `Failed: ${error.message}`, severity: "error" });
    }
  };

  const sendChatMessage = async () => {
    if (!isConnected) return setMessage({ open: true, text: "Connect wallet first!", severity: "error" });
    if (!discordLink[userAddress]) return setMessage({ open: true, text: "Link Discord first!", severity: "error" });
    if (!chatInput.trim()) return;

    try {
      const response = await fetch(`${CHAT_BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: discordLink[userAddress], text: chatInput }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const newMessage = await response.json();
      setChatMessages(prev => [...prev, newMessage]);
      setChatInput("");
    } catch (error) {
      console.error("Error sending chat message:", error);
      setMessage({ open: true, text: "Failed to send message!", severity: "error" });
    }
  };

  const handleSolutionChange = (id, value) => setSolutions(prev => ({ ...prev, [id]: value }));
  const handleHintUpdateChange = (id, value) => setHintUpdates(prev => ({ ...prev, [id]: value }));

  const togglePlay = () => {
    const audio = document.getElementById("backgroundMusic");
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(e => console.error("Audio play error:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const audio = document.getElementById("backgroundMusic");
    if (audio) {
      audio.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const activeTreasures = treasures.filter(t => !t.isClaimed);
  const claimedTreasures = treasures.filter(t => t.isClaimed);
  const paginatedLeaderboard = leaderboard.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  if (isLoading) {
    return (
      <FullScreenBox sx={{ justifyContent: "center", alignItems: "center" }}>
        <CircularProgress sx={{ color: "#ffd700" }} />
        <GoldTypography variant="h5" sx={{ ml: 2 }}>Loading Treasure Hunt...</GoldTypography>
      </FullScreenBox>
    );
  }

  return (
    <FullScreenBox>
      <Box sx={{ flex: 2, height: "100%", overflowY: "auto", margin: 0, padding: 0 }}>
        <ParchmentPaper elevation={3} sx={{ height: "100%" }}>
          <GoldTypography variant="h3" align="center" gutterBottom>Treasure Hunt</GoldTypography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, alignItems: 'center' }}>
            {isConnected ? (
              <WoodenButton onClick={disconnectWallet}>Disconnect Wallet</WoodenButton>
            ) : (
              <WoodenButton onClick={connectWallet}>Connect Wallet</WoodenButton>
            )}
            <WoodenButton onClick={() => refreshTreasures(contract)} disabled={!contract} sx={{ ml: 2 }}>
              Refresh Map
            </WoodenButton>
            {isConnected && !discordLink[userAddress] && (
              <WoodenButton onClick={linkDiscord} sx={{ ml: 2 }}>
                Link Discord
              </WoodenButton>
            )}
            {isConnected && discordLink[userAddress] && (
              <DiscordLabel sx={{ ml: 2 }}>
                {discordLink[userAddress]}
              </DiscordLabel>
            )}
          </Box>
          <GoldTypography variant="h5" align="center">Your Points: {points}</GoldTypography>
          <GoldTypography variant="h5" align="center">Your Booty Claimed: {treasuresClaimed}</GoldTypography>
          <TreasureChestSpinner />
          <GoldTypography variant="h4" align="center" sx={{ mt: 2 }}>Active Treasures</GoldTypography>
          {activeTreasures.length === 0 ? (
            <Typography sx={{ fontFamily: "'Pirata One', cursive", color: "#8b4513", textAlign: "center", mt: 2 }}>
              No active treasures to hunt, arr!
            </Typography>
          ) : (
            activeTreasures.map(t => (
              <Box key={t.id} sx={{ my: 2, p: 2, backgroundColor: "#fff8dc", border: "2px dashed #8b4513", borderRadius: "5px" }}>
                <Typography sx={{ fontFamily: "'Pirata One', cursive", color: "#8b4513" }}>
                  Treasure #{t.id} | Clue: {t.clueHash?.slice(0, 10)}... | Points: {t.points}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography sx={{ color: "#8b4513" }}>Hint: {t.hint}</Typography>
                  <TreasureInput
                    value={solutions[t.id] || ""}
                    onChange={e => handleSolutionChange(t.id, e.target.value)}
                    placeholder="Guess the riddle..."
                    size="small"
                    sx={{ mr: 1, mt: 1 }}
                  />
                  <WoodenButton onClick={() => claim(t.id)}>Claim Booty</WoodenButton>
                  {isConnected && userAddress?.toLowerCase() === DEPLOYER_ADDRESS.toLowerCase() && (
                    <>
                      <TreasureInput
                        value={hintUpdates[t.id] || ""}
                        onChange={e => handleHintUpdateChange(t.id, e.target.value)}
                        placeholder="Update hint..."
                        size="small"
                        sx={{ mt: 1, mr: 1 }}
                      />
                      <WoodenButton onClick={() => updateHint(t.id)}>Update Hint</WoodenButton>
                    </>
                  )}
                </Box>
              </Box>
            ))
          )}
          <GoldTypography variant="h4" align="center" sx={{ mt: 2 }}>Claimed Booty</GoldTypography>
          {claimedTreasures.map(t => (
            <Box key={t.id} sx={{ my: 2, p: 2, backgroundColor: "#fff8dc", border: "2px dashed #8b4513", borderRadius: "5px" }}>
              <Typography sx={{ fontFamily: "'Pirata One', cursive", color: "#8b4513" }}>
                Treasure #{t.id} | Claimant: {t.claimant?.slice(0, 6)}... | Points: {t.points}
              </Typography>
            </Box>
          ))}
          {isConnected && userAddress?.toLowerCase() === DEPLOYER_ADDRESS.toLowerCase() && (
            <Box sx={{ mt: 4 }}>
              <GoldTypography variant="h5" align="center">Admin: Add New Treasure</GoldTypography>
              <TreasureInput value={newClue} onChange={e => setNewClue(e.target.value)} placeholder="Enter new clue..." fullWidth sx={{ mb: 2 }} />
              <TreasureInput value={newPoints} onChange={e => setNewPoints(e.target.value)} placeholder="Enter points..." type="number" fullWidth sx={{ mb: 2 }} />
              <TreasureInput value={newHint} onChange={e => setNewHint(e.target.value)} placeholder="Enter hint..." fullWidth sx={{ mb: 2 }} />
              <WoodenButton onClick={addTreasure}>Deploy Treasure</WoodenButton>
            </Box>
          )}
        </ParchmentPaper>
      </Box>
      <Box sx={{ flex: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', height: "100%", width: "100%", minWidth: 0, margin: 0, padding: 0 }}>
        <ParchmentPaper elevation={3} sx={{ flex: "0 1 auto", margin: 0 }}>
          <GoldTypography variant="h4" align="center" gutterBottom>Leaderboard</GoldTypography>
          {paginatedLeaderboard.length > 0 ? (
            <Box>
              {paginatedLeaderboard.map((user, index) => (
                <Box key={user.address} sx={{ mb: 1 }}>
                  <Typography sx={{ fontFamily: "'Pirata One', cursive", color: "#8b4513", textAlign: "center" }}>
                    #{page * itemsPerPage + index + 1} {discordLink[user.address] || `${user.address?.slice(0, 6)}...`}
                  </Typography>
                  <Typography sx={{ fontFamily: "'Pirata One', cursive", color: "#8b4513", textAlign: "center" }}>
                    Points: {user.points}
                  </Typography>
                  <Typography sx={{ fontFamily: "'Pirata One', cursive", color: "#8b4513", textAlign: "center" }}>
                    Booty Claimed: {user.treasures}
                  </Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <WoodenButton onClick={() => setPage(page - 1)} disabled={page === 0} sx={{ mr: 1 }}>Previous</WoodenButton>
                <WoodenButton onClick={() => setPage(page + 1)} disabled={(page + 1) * itemsPerPage >= leaderboard.length}>Next</WoodenButton>
              </Box>
            </Box>
          ) : (
            <Typography sx={{ fontFamily: "'Pirata One', cursive", color: "#8b4513", textAlign: "center" }}>No pirates yet!</Typography>
          )}
          {isConnected && userAddress?.toLowerCase() === DEPLOYER_ADDRESS.toLowerCase() && (
            <Box sx={{ mt: 2 }}>
              <TreasureInput
                placeholder="User address to forgive"
                onKeyPress={(e) => e.key === "Enter" && forgiveUser(e.target.value)}
                fullWidth
              />
              <Typography sx={{ fontFamily: "'Pirata One', cursive", color: "#8b4513", fontSize: "12px", textAlign: "center" }}>
                Admin: Enter address to unlink Discord
              </Typography>
            </Box>
          )}
          <audio id="backgroundMusic" src="/audio/Irish_Rovers.mp3" preload="auto" loop />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <WoodenButton onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</WoodenButton>
            <WoodenButton onClick={toggleMute} sx={{ ml: 1 }}>{isMuted ? "Unmute" : "Mute"}</WoodenButton>
          </Box>
        </ParchmentPaper>
        <ChatBox sx={{ margin: 0 }}>
          <GoldTypography variant="h5" align="center">Crew Chat</GoldTypography>
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {chatMessages.map((msg, index) => (
              <Typography key={index} sx={{ color: "black", fontFamily: "'Pirata One', cursive", padding: "5px 0" }}>
                {msg.user}: {msg.text}
              </Typography>
            ))}
          </Box>
          {isConnected && (
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: "10px" }}>
              <TreasureInput
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Send a message..."
                fullWidth
                onKeyPress={e => e.key === "Enter" && sendChatMessage()}
              />
              <WoodenButton onClick={sendChatMessage}>Send</WoodenButton>
            </Box>
          )}
        </ChatBox>
      </Box>
      <Snackbar open={message.open} autoHideDuration={5000} onClose={() => setMessage({ ...message, open: false })} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={message.severity} sx={{ width: "100%" }}>{message.text}</Alert>
      </Snackbar>
    </FullScreenBox>
  );
}

export default App;
