"use client";

import { useEffect, useMemo, useState } from "react";

type Game = {
  id: string;
  home: string;
  away: string;
  homeShort: string;
  awayShort: string;
  odds: { home: number; away: number; bttsYes: number; bttsNo: number; exactScores: Record<string, number> };
};

type Selection = { id: string; gameId: string; game: string; market: string; pick: string; odd: number; sport?: Sport; marketCode?: string; subject?: string };
type TicketMode = "multiple" | "singles";
type Sport = "football" | "f1";
type F1Option = { id: string; label: string; odd: number; group?: string; subject?: string };
type F1Market = { id: string; section: string; title: string; options: F1Option[] };
type F1Config = { eventName: string; markets: F1Market[] };
type SavedTicket = {
  id: string;
  mode: TicketMode;
  createdAt: string;
  selections: Selection[];
  stake: number;
  singleStakes: Record<string, number>;
  totalOdd: number;
  totalStake: number;
  potentialReturn: number;
  status: "pendente" | "conferido";
};

const DEFAULT_GAMES: Game[] = [
  {
    "id": "sarajevo-girondino",
    "home": "FK Sarajevo",
    "away": "CA Girondino",
    "homeShort": "SRJ",
    "awayShort": "CAG",
    "odds": {
      "home": 1.51,
      "away": 2.57,
      "bttsYes": 1.3,
      "bttsNo": 3.6,
      "exactScores": {
        "3x0": 5.14,
        "3x1": 3.99,
        "3x2": 4.64,
        "0x3": 11.97,
        "1x3": 7.0,
        "2x3": 6.14
      }
    }
  },
  {
    "id": "steaua-real",
    "home": "Steaua Bucareste",
    "away": "Real Madrid",
    "homeShort": "BUC",
    "awayShort": "RMA",
    "odds": {
      "home": 1.97,
      "away": 1.85,
      "bttsYes": 1.27,
      "bttsNo": 3.81,
      "exactScores": {
        "3x0": 8.02,
        "3x1": 5.26,
        "3x2": 5.17,
        "0x3": 7.25,
        "1x3": 4.91,
        "2x3": 5.0
      }
    }
  },
  {
    "id": "milan-lazio",
    "home": "AC Milan",
    "away": "SS Lazio",
    "homeShort": "MIL",
    "awayShort": "LAZ",
    "odds": {
      "home": 1.49,
      "away": 2.63,
      "bttsYes": 1.3,
      "bttsNo": 3.57,
      "exactScores": {
        "3x0": 5.03,
        "3x1": 3.94,
        "3x2": 4.62,
        "0x3": 12.35,
        "1x3": 7.17,
        "2x3": 6.24
      }
    }
  },
  {
    "id": "fiorentina-constantino",
    "home": "ACF Fiorentina",
    "away": "Imperial Constantino",
    "homeShort": "FIO",
    "awayShort": "ICS",
    "odds": {
      "home": 1.44,
      "away": 2.8,
      "bttsYes": 1.31,
      "bttsNo": 3.49,
      "exactScores": {
        "3x0": 4.71,
        "3x1": 3.8,
        "3x2": 4.6,
        "0x3": 13.51,
        "1x3": 7.67,
        "2x3": 6.54
      }
    }
  }
];

const SCORE_OPTIONS = ["3x0", "3x1", "3x2", "0x3", "1x3", "2x3"];
const ADMIN_PASSWORD = "bunker123";
const F1_SECTIONS = ["PILOTOS", "EQUIPES", "TEMPORADA"];
const F1_DRIVERS = [
  { id: "ireland", name: "I. Ireland (REN)", teamId: "renault", odds: { winner: 5.40, podiumYes: 1.85, podiumNo: 1.64, pole: 9.07 } },
  { id: "mclaren", name: "B. McLaren (POR)", teamId: "porsche", odds: { winner: 8.96, podiumYes: 2.51, podiumNo: 1.33, pole: 13.64 } },
  { id: "bonnier", name: "J. Bonnier (LOT)", teamId: "lotus", odds: { winner: 9.29, podiumYes: 2.56, podiumNo: 1.32, pole: 10.34 } },
  { id: "moss", name: "S. Moss (LOT)", teamId: "lotus", odds: { winner: 9.78, podiumYes: 2.64, podiumNo: 1.30, pole: 9.73 } },
  { id: "brabham", name: "J. Brabham (COO)", teamId: "cooper", odds: { winner: 10.83, podiumYes: 2.79, podiumNo: 1.26, pole: 6.15 } },
  { id: "ginther", name: "R. Ginther (FER)", teamId: "ferrari", odds: { winner: 12.10, podiumYes: 2.96, podiumNo: 1.23, pole: 6.24 } },
  { id: "gendebien", name: "O. Gendebien (REN)", teamId: "renault", odds: { winner: 12.97, podiumYes: 3.07, podiumNo: 1.21, pole: 10.73 } },
  { id: "clark", name: "J. Clark (POR)", teamId: "porsche", odds: { winner: 13.97, podiumYes: 3.18, podiumNo: 1.20, pole: 16.79 } },
  { id: "allison", name: "C. Allison (COO)", teamId: "cooper", odds: { winner: 20.65, podiumYes: 3.79, podiumNo: 1.13, pole: 20.87 } },
  { id: "mairesse", name: "W. Mairesse (FER)", teamId: "ferrari", odds: { winner: 21.41, podiumYes: 3.85, podiumNo: 1.12, pole: 22.19 } },
  { id: "gonzalez", name: "J. F. González (MAT)", teamId: "matra", odds: { winner: 22.67, podiumYes: 3.92, podiumNo: 1.12, pole: 21.50 } },
  { id: "phil-hill", name: "P. Hill (LAM)", teamId: "lamborghini", odds: { winner: 25.21, podiumYes: 4.07, podiumNo: 1.11, pole: 27.30 } },
  { id: "surtees", name: "J. Surtees (LAM)", teamId: "lamborghini", odds: { winner: 26.56, podiumYes: 4.14, podiumNo: 1.10, pole: 30.80 } },
  { id: "von-trips", name: "W. von Trips (ALF)", teamId: "alfa-romeo", odds: { winner: 26.96, podiumYes: 4.15, podiumNo: 1.10, pole: 29.88 } },
  { id: "trintignant", name: "M. Trintignant (MAT)", teamId: "matra", odds: { winner: 29.76, podiumYes: 4.30, podiumNo: 1.09, pole: 40.42 } },
  { id: "graham-hill", name: "G. Hill (ALF)", teamId: "alfa-romeo", odds: { winner: 30.96, podiumYes: 4.33, podiumNo: 1.09, pole: 40.70 } },
];
const F1_TEAMS = [
  { id: "renault", name: "Renault (GEN+IRE)", odds: { mostPoints: 3.75, bothScoreYes: 2.44, bothScoreNo: 1.35 } },
  { id: "porsche", name: "Porsche (CLA+MCL)", odds: { mostPoints: 5.44, bothScoreYes: 3.09, bothScoreNo: 1.21 } },
  { id: "lotus", name: "Lotus (BON+MOS)", odds: { mostPoints: 4.68, bothScoreYes: 2.64, bothScoreNo: 1.30 } },
  { id: "cooper", name: "Cooper (BRA+ALL)", odds: { mostPoints: 7.20, bothScoreYes: 3.89, bothScoreNo: 1.12 } },
  { id: "ferrari", name: "Ferrari (GIN+MAI)", odds: { mostPoints: 7.85, bothScoreYes: 4.06, bothScoreNo: 1.11 } },
  { id: "lamborghini", name: "Lamborghini (HIL+SUR)", odds: { mostPoints: 13.22, bothScoreYes: 4.99, bothScoreNo: 1.05 } },
  { id: "matra", name: "Matra (GON+TRI)", odds: { mostPoints: 13.13, bothScoreYes: 4.99, bothScoreNo: 1.05 } },
  { id: "alfa-romeo", name: "Alfa Romeo (VTR+GHI)", odds: { mostPoints: 14.72, bothScoreYes: 5.12, bothScoreNo: 1.05 } },
];
const F1_HEAD_TO_HEAD = [
  { id: "brabham-allison", driver1: "brabham", driver1Odd: 1.39, driver2: "allison", driver2Odd: 2.32 },
  { id: "moss-bonnier", driver1: "moss", driver1Odd: 1.78, driver2: "bonnier", driver2Odd: 1.70 },
  { id: "ginther-mairesse", driver1: "ginther", driver1Odd: 1.42, driver2: "mairesse", driver2Odd: 2.23 },
  { id: "gonzalez-trintignant", driver1: "gonzalez", driver1Odd: 1.56, driver2: "trintignant", driver2Odd: 1.96 },
  { id: "gendebien-ireland", driver1: "gendebien", driver1Odd: 2.57, driver2: "ireland", driver2Odd: 1.31 },
  { id: "surtees-phil-hill", driver1: "surtees", driver1Odd: 1.78, driver2: "phil-hill", driver2Odd: 1.70 },
  { id: "clark-mclaren", driver1: "clark", driver1Odd: 2.11, driver2: "mclaren", driver2Odd: 1.48 },
  { id: "von-trips-graham-hill", driver1: "von-trips", driver1Odd: 1.65, driver2: "graham-hill", driver2Odd: 1.84 },
];
const F1_TEAM_CHAMPION_ODDS: Record<string, number> = {
  renault: 1.64,
  lotus: 3.47,
  porsche: 5.09,
  cooper: 31.67,
  ferrari: 52.21,
  lamborghini: 500,
  matra: 500,
  "alfa-romeo": 500,
};
const F1_DRIVER_CHAMPION_ODDS: Record<string, number> = {
  ireland: 1.39,
  mclaren: 6.94,
  bonnier: 10.21,
  moss: 13.78,
  brabham: 25.74,
  ginther: 44.30,
  clark: 50.43,
  gendebien: 56.33,
  allison: 292.14,
  mairesse: 342.89,
  gonzalez: 413.69,
  "phil-hill": 500,
  surtees: 500,
  "von-trips": 500,
  trintignant: 500,
  "graham-hill": 500,
};
const getF1Driver = (id: string) => {
  const driver = F1_DRIVERS.find((item) => item.id === id);
  if (!driver) throw new Error(`Piloto de F1 não encontrado: ${id}`);
  return driver;
};
const DEFAULT_F1: F1Config = {
  eventName: "PRÓXIMO GRANDE PRÊMIO",
  markets: [
    { id: "race-winner", section: "PILOTOS", title: "Vencedor", options: F1_DRIVERS.map((driver) => ({ id: driver.id, label: driver.name, odd: driver.odds.winner })) },
    { id: "podium", section: "PILOTOS", title: "Pódio: sim/não", options: F1_DRIVERS.flatMap((driver) => [
      { id: `${driver.id}-yes`, group: driver.id, subject: driver.id, label: `${driver.name} — Sim`, odd: driver.odds.podiumYes },
      { id: `${driver.id}-no`, group: driver.id, subject: driver.id, label: `${driver.name} — Não`, odd: driver.odds.podiumNo },
    ]) },
    { id: "h2h", section: "PILOTOS", title: "Head-to-head", options: F1_HEAD_TO_HEAD.flatMap((duel) => {
      const driver1 = getF1Driver(duel.driver1);
      const driver2 = getF1Driver(duel.driver2);
      return [
        { id: `${duel.id}-${driver1.id}`, group: duel.id, subject: driver1.id, label: driver1.name, odd: duel.driver1Odd },
        { id: `${duel.id}-${driver2.id}`, group: duel.id, subject: driver2.id, label: driver2.name, odd: duel.driver2Odd },
      ];
    }) },
    { id: "pole", section: "PILOTOS", title: "Pole position", options: F1_DRIVERS.map((driver) => ({ id: driver.id, label: driver.name, odd: driver.odds.pole })) },
    { id: "team-points", section: "EQUIPES", title: "Equipe marca mais pontos", options: F1_TEAMS.map((team) => ({ id: team.id, label: team.name, odd: team.odds.mostPoints })) },
    { id: "both-score", section: "EQUIPES", title: "Ambos pontuam: sim/não", options: F1_TEAMS.flatMap((team) => [
      { id: `${team.id}-yes`, group: team.id, label: `${team.name} — Sim`, odd: team.odds.bothScoreYes },
      { id: `${team.id}-no`, group: team.id, label: `${team.name} — Não`, odd: team.odds.bothScoreNo },
    ]) },
    { id: "driver-champion", section: "TEMPORADA", title: "Piloto campeão", options: F1_DRIVERS.map((driver) => ({
      id: driver.id,
      label: driver.name,
      odd: F1_DRIVER_CHAMPION_ODDS[driver.id],
    })) },
    { id: "team-champion", section: "TEMPORADA", title: "Equipe campeã", options: F1_TEAMS.map((team) => ({
      id: team.id,
      label: team.name,
      odd: F1_TEAM_CHAMPION_ODDS[team.id],
    })) },
  ],
};

const fmtOdd = (value: number) => value.toFixed(2);
const money = (value: number) => new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
const toNumber = (value: string | undefined) => Number((value ?? "").replace(",", ".")) || 0;

export default function Home() {
  const [activeSport, setActiveSport] = useState<Sport>("football");
  const [games, setGames] = useState<Game[]>(DEFAULT_GAMES);
  const [f1, setF1] = useState<F1Config>(DEFAULT_F1);
  const [activeF1Market, setActiveF1Market] = useState("race-winner");
  const [selections, setSelections] = useState<Selection[]>([]);
  const [ticketMode, setTicketMode] = useState<TicketMode>("multiple");
  const [selectionWarning, setSelectionWarning] = useState("");
  const [stake, setStake] = useState("100");
  const [singleStakes, setSingleStakes] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState("");
  const [savedTickets, setSavedTickets] = useState<SavedTicket[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [adminTab, setAdminTab] = useState<"round" | "f1" | "tickets">("round");
  const [ticketSearch, setTicketSearch] = useState("");
  const [adminMessage, setAdminMessage] = useState("");

  useEffect(() => {
    const savedGames = window.localStorage.getItem("bunker-bet-games");
    const savedF1 = window.localStorage.getItem("bunker-bet-f1-v5");
    const savedHistory = window.localStorage.getItem("bunker-bet-tickets");
    // Dados locais só podem ser restaurados após a montagem no navegador.
    if (savedGames) try {
      const parsed = JSON.parse(savedGames) as Array<Game & { odds: Game["odds"] & { exact?: number } }>;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGames(parsed.map((game) => ({ ...game, odds: { ...game.odds, exactScores: game.odds.exactScores ?? Object.fromEntries(SCORE_OPTIONS.map((score) => [score, game.odds.exact ?? 6])) } })));
    } catch { /* mantém o padrão */ }
    if (savedF1) try { setF1(JSON.parse(savedF1)); } catch { /* mantém o padrão */ }
    if (savedHistory) try { setSavedTickets(JSON.parse(savedHistory)); } catch { /* começa vazio */ }
  }, []);

  const totalOdd = useMemo(() => selections.reduce((total, item) => total * item.odd, 1), [selections]);
  const stakeNumber = toNumber(stake);
  const singlesTotalStake = selections.reduce((sum, item) => sum + toNumber(singleStakes[item.id]), 0);
  const singlesReturn = selections.reduce((sum, item) => sum + toNumber(singleStakes[item.id]) * item.odd, 0);
  const totalStake = ticketMode === "multiple" ? stakeNumber : singlesTotalStake;
  const returnValue = ticketMode === "multiple" ? stakeNumber * (selections.length ? totalOdd : 0) : singlesReturn;
  const ticketValid = selections.length > 0 && totalStake > 0 && (ticketMode === "multiple" || selections.every((item) => toNumber(singleStakes[item.id]) > 0));

  function areDependent(left: Selection, right: Selection) {
    if (left.sport === "f1" && right.sport === "f1") {
      const codes = new Set([left.marketCode, right.marketCode]);
      const winnerDependency = codes.has("race-winner") && (codes.has("podium") || codes.has("h2h"));
      return Boolean(winnerDependency && left.subject && left.subject === right.subject);
    }
    if (left.gameId !== right.gameId) return false;
    const leftExact = left.market === "Placar exato";
    const rightExact = right.market === "Placar exato";
    const leftDerived = left.market === "Vencedor" || left.market === "Ambas marcam";
    const rightDerived = right.market === "Vencedor" || right.market === "Ambas marcam";
    return (leftExact && rightDerived) || (rightExact && leftDerived);
  }

  function toggleSelection(selection: Selection) {
    setCopiedId("");
    if (isSelected(selection.id)) {
      setSelections((current) => current.filter((item) => item.id !== selection.id));
      setSelectionWarning("");
      return;
    }
    if (ticketMode === "multiple" && selections.some((item) => areDependent(item, selection))) {
      setSelectionWarning("Uma das escolhas já determina ou contradiz o outro mercado. Elas não podem ser combinadas na mesma múltipla.");
      return;
    }
    setSelectionWarning("");
    setSelections((current) => {
      return [...current.filter((item) => !(item.gameId === selection.gameId && item.market === selection.market)), selection];
    });
    setSingleStakes((current) => current[selection.id] ? current : { ...current, [selection.id]: "10" });
  }

  function isSelected(id: string) { return selections.some((item) => item.id === id); }

  function selectMultipleMode() {
    const hasDependencies = selections.some((item, index) => selections.slice(index + 1).some((other) => areDependent(item, other)));
    if (hasDependencies) {
      setSelectionWarning("Remova as combinações dependentes antes de transformar o ticket em múltipla.");
      return;
    }
    setSelectionWarning("");
    setTicketMode("multiple");
    setCopiedId("");
  }

  function selectScore(game: Game, score: string) {
    setScores((current) => ({ ...current, [game.id]: score }));
    toggleSelection({ id: `${game.id}-score-${score}`, gameId: game.id, game: `${game.home} x ${game.away}`, market: "Placar exato", pick: score.replace("x", " x "), odd: game.odds.exactScores[score] });
  }

  function selectF1(market: F1Market, option: F1Option) {
    const group = option.group ?? "principal";
    toggleSelection({
      id: `f1-${market.id}-${option.id}`,
      gameId: `f1-${market.id}-${group}`,
      game: market.section === "TEMPORADA" ? "Temporada" : f1.eventName,
      market: market.title,
      pick: option.label,
      odd: option.odd,
      sport: "f1",
      marketCode: market.id,
      subject: option.subject ?? (market.id === "podium" ? option.group : option.id),
    });
  }

  function createId(mode: TicketMode, value: number, odd: number) {
    const modeDigit = mode === "multiple" ? "1" : "2";
    const valueCents = Math.min(999999, Math.round(value * 100)).toString().padStart(6, "0");
    const oddCents = Math.min(99999, Math.round(odd * 100)).toString().padStart(5, "0");
    const nonce = (crypto.getRandomValues(new Uint8Array(1))[0] % 100).toString().padStart(2, "0");
    const payload = `${modeDigit}${valueCents}${oddCents}${nonce}`;
    const checksum = (BigInt(payload) % 97n).toString().padStart(2, "0");
    return `${payload}${checksum}`;
  }

  function decodeId(id: string) {
    const digits = id.replace(/\D/g, "");
    if (digits.length !== 16) return null;
    const payload = digits.slice(0, -2);
    const checksum = digits.slice(-2);
    if ((BigInt(payload) % 97n).toString().padStart(2, "0") !== checksum) return null;
    const modeDigit = payload[0];
    if (modeDigit !== "1" && modeDigit !== "2") return null;
    return {
      mode: modeDigit === "1" ? "Múltipla" : "Apostas separadas",
      value: Number(payload.slice(1, 7)) / 100,
      odd: Number(payload.slice(7, 12)) / 100,
    };
  }

  function buildTicket(id: string) {
    const header = `🎟️ BUNKER BET #${id}`;
    if (ticketMode === "multiple") {
      return [
        header,
        `MÚLTIPLA · ${selections.length} seleções`,
        ...selections.map((item, index) => `${index + 1}. ${item.game} — ${item.pick} @${fmtOdd(item.odd)}`),
        `£${money(stakeNumber)} · Odd ${fmtOdd(totalOdd)} · Retorno £${money(returnValue)}`,
      ].join("\n");
    }
    return [
      header,
      `SEPARADAS · ${selections.length} apostas`,
      ...selections.map((item, index) => `${index + 1}. ${item.game} — ${item.pick} @${fmtOdd(item.odd)} · £${money(toNumber(singleStakes[item.id]))}`),
      `Total £${money(totalStake)} · Retorno £${money(returnValue)}`,
    ].join("\n");
  }

  async function copyTicket() {
    if (!ticketValid) return;
    const verifiableOdd = ticketMode === "multiple" ? totalOdd : returnValue / totalStake;
    let id = createId(ticketMode, totalStake, verifiableOdd);
    while (savedTickets.some((ticket) => ticket.id === id)) id = createId(ticketMode, totalStake, verifiableOdd);
    const saved: SavedTicket = {
      id, mode: ticketMode, createdAt: new Date().toISOString(), selections, stake: stakeNumber,
      singleStakes: Object.fromEntries(Object.entries(singleStakes).map(([key, value]) => [key, toNumber(value)])),
      totalOdd, totalStake, potentialReturn: returnValue, status: "pendente",
    };
    const nextHistory = [saved, ...savedTickets];
    setSavedTickets(nextHistory);
    window.localStorage.setItem("bunker-bet-tickets", JSON.stringify(nextHistory));
    await navigator.clipboard.writeText(buildTicket(id));
    setCopiedId(id);
  }

  function updateGame(id: string, field: string, value: string) {
    setGames((current) => current.map((game) => {
      if (game.id !== id) return game;
      if (field.startsWith("odds.")) {
        const oddField = field.split(".")[1] as keyof Game["odds"];
        return { ...game, odds: { ...game.odds, [oddField]: Number(value) || 0 } };
      }
      return { ...game, [field]: value };
    }));
  }

  function addGame() {
    setGames((current) => [...current, { id: `jogo-${Date.now()}`, home: "Mandante", away: "Visitante", homeShort: "MAN", awayShort: "VIS", odds: { home: 2, away: 2.8, bttsYes: 1.8, bttsNo: 2, exactScores: { "3x0": 6, "3x1": 5, "3x2": 7, "0x3": 8, "1x3": 6.5, "2x3": 7.5 } } }]);
  }

  function saveGames() {
    window.localStorage.setItem("bunker-bet-games", JSON.stringify(games));
    setAdminMessage("Rodada salva neste navegador.");
    window.setTimeout(() => setAdminMessage(""), 2600);
  }

  function saveF1() {
    window.localStorage.setItem("bunker-bet-f1-v5", JSON.stringify(f1));
    setAdminMessage("Mercados da Fórmula 1 salvos neste navegador.");
    window.setTimeout(() => setAdminMessage(""), 2600);
  }

  function updateF1Option(marketId: string, optionId: string, field: "label" | "odd", value: string) {
    setF1((current) => ({ ...current, markets: current.markets.map((market) => market.id !== marketId ? market : {
      ...market, options: market.options.map((option) => option.id !== optionId ? option : { ...option, [field]: field === "odd" ? Number(value) || 0 : value }),
    }) }));
  }

  async function copyGamesJson() {
    await navigator.clipboard.writeText(JSON.stringify(games, null, 2));
    setAdminMessage("JSON copiado.");
  }

  function submitPassword() {
    setPasswordError("");
    if (password !== ADMIN_PASSWORD) return setPasswordError("Senha incorreta.");
    setAdminUnlocked(true); setPassword("");
  }

  function openAdmin() {
    setAdminUnlocked(false); setPassword(""); setPasswordError(""); setAdminOpen(true);
  }

  function updateTicketStatus(id: string) {
    const next = savedTickets.map((ticket) => ticket.id === id ? { ...ticket, status: ticket.status === "pendente" ? "conferido" as const : "pendente" as const } : ticket);
    setSavedTickets(next); window.localStorage.setItem("bunker-bet-tickets", JSON.stringify(next));
  }

  const filteredTickets = savedTickets.filter((ticket) => ticket.id.includes(ticketSearch.trim().toUpperCase()));
  const decodedTicket = ticketSearch ? decodeId(ticketSearch) : null;
  const currentF1Market = f1.markets.find((market) => market.id === activeF1Market) ?? f1.markets[0];

  function f1OptionButton(market: F1Market, option: F1Option, compactLabel?: string) {
    const id = `f1-${market.id}-${option.id}`;
    return <button key={option.id} className={isSelected(id) ? "f1-odd active" : "f1-odd"} onClick={() => selectF1(market, option)}><span>{compactLabel ?? option.label}</span><b>{fmtOdd(option.odd)}</b></button>;
  }

  function renderF1Options(market: F1Market) {
    if (!market.options.some((option) => option.group)) return <div className="f1-options driver-grid">{market.options.map((option) => f1OptionButton(market, option))}</div>;
    const groups = market.options.reduce<Record<string, F1Option[]>>((result, option) => {
      const key = option.group ?? option.id;
      result[key] = [...(result[key] ?? []), option];
      return result;
    }, {});
    if (market.id === "h2h") return <div className="h2h-list">{Object.entries(groups).map(([group, options]) => <div className="h2h-row" key={group}>{f1OptionButton(market, options[0])}<strong>VS.</strong>{f1OptionButton(market, options[1])}</div>)}</div>;
    return <div className="binary-list">{Object.entries(groups).map(([group, options]) => {
      const subject = options[0].label.split(" — ")[0];
      return <div className="binary-row" key={group}><strong>{subject}</strong><div>{options.map((option) => f1OptionButton(market, option, option.label.split(" — ")[1] ?? option.label))}</div></div>;
    })}</div>;
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand-wrap"><div className="crest" aria-hidden="true"><span>BB</span><small>RP</small></div><div className="brand">BUNKER BET</div><div className="official">CASA DE APOSTAS OFICIAL</div></div>
        <div className="header-actions"><button className="admin-link" onClick={openAdmin}>PAINEL DO ADM</button><div className="round-status"><i /> {activeSport === "football" ? "RODADA 12 ABERTA" : "GP ABERTO"}</div></div>
      </header>

      <nav className="sport-tabs" aria-label="Modalidade">
        <button className={activeSport === "football" ? "active" : ""} onClick={() => setActiveSport("football")}><span>⚽</span> FUTEBOL</button>
        <button className={activeSport === "f1" ? "active" : ""} onClick={() => setActiveSport("f1")}><span>🏁</span> FÓRMULA 1</button>
      </nav>

      <div className="page-grid">
        {activeSport === "football" ? <section className="content">
          <div className="hero"><div><p className="eyebrow">CAMPEONATO BUNKERIANO</p><h1>MONTE SEU BILHETE.<br />FAÇA HISTÓRIA.</h1><p className="hero-copy">Escolha seus palpites e gere o ticket para conferência no Discord.</p></div><div className="ticket-number"><span>TICKET Nº</span><strong>BB-512</strong><b>★ ★ ★</b></div></div>
          <div className="section-heading"><span className="ball-mark">◉</span><h2>JOGOS DA RODADA</h2><span className="count">{games.length} partidas</span></div>
          <div className="games">
            {games.map((game) => {
              const score = scores[game.id] ?? "3x0";
              const winnerOptions = [{ key: "home", label: game.home, pick: `${game.home} vence`, odd: game.odds.home }, { key: "away", label: game.away, pick: `${game.away} vence`, odd: game.odds.away }];
              return <article className="match-card" key={game.id}>
                <div className="match-head"><div className="team home-team"><span className="team-badge">{game.homeShort}</span><strong>{game.home}</strong></div><div className="versus"><b>— &nbsp; VS &nbsp; —</b></div><div className="team away-team"><strong>{game.away}</strong><span className="team-badge away">{game.awayShort}</span></div></div>
                <div className="markets">
                  <div className="market winner-market"><h3>VENCEDOR</h3><div className="winner-options">{winnerOptions.map((option) => { const id = `${game.id}-winner-${option.key}`; return <button key={id} className={isSelected(id) ? "odd active" : "odd"} onClick={() => toggleSelection({ id, gameId: game.id, game: `${game.home} x ${game.away}`, market: "Vencedor", pick: option.pick, odd: option.odd })}><span>{option.label}</span><b>{fmtOdd(option.odd)}</b></button>; })}</div></div>
                  <div className="market score-market"><h3>PLACAR EXATO</h3><div className="score-pick"><select aria-label={`Placar de ${game.home} contra ${game.away}`} value={score} onChange={(e) => setScores((current) => ({ ...current, [game.id]: e.target.value }))}>{SCORE_OPTIONS.map((option) => <option key={option} value={option}>{option.replace("x", " × ")}</option>)}</select><button className={isSelected(`${game.id}-score-${score}`) ? "score-odd active" : "score-odd"} onClick={() => selectScore(game, score)}>{fmtOdd(game.odds.exactScores[score])}</button></div></div>
                  <div className="market btts-market"><h3>AMBAS MARCAM</h3><div className="btts-options">{[{ key: "yes", label: "Sim", odd: game.odds.bttsYes }, { key: "no", label: "Não", odd: game.odds.bttsNo }].map((option) => { const id = `${game.id}-btts-${option.key}`; return <button key={id} className={isSelected(id) ? "odd active" : "odd"} onClick={() => toggleSelection({ id, gameId: game.id, game: `${game.home} x ${game.away}`, market: "Ambas marcam", pick: option.label, odd: option.odd })}><span>{option.label}</span><b>{fmtOdd(option.odd)}</b></button>; })}</div></div>
                </div>
              </article>;
            })}
          </div>
        </section> : <section className="content f1-content">
          <div className="hero f1-hero"><div><p className="eyebrow">BUNKER MOTORSPORT</p><h1>ACELERE SEUS<br />PALPITES.</h1><p className="hero-copy">Escolha pilotos, equipes e mercados da temporada para montar seu ticket.</p></div><div className="f1-flag" aria-hidden="true"><span>01</span><b>RACE</b></div></div>
          <div className="f1-event"><span>PRÓXIMO EVENTO</span><strong>{f1.eventName}</strong></div>
          <div className="f1-browser">
            <div className="f1-market-nav">{F1_SECTIONS.map((section) => <div className="f1-nav-group" key={section}><strong>{section}</strong>{f1.markets.filter((market) => market.section === section).map((market) => <button key={market.id} className={activeF1Market === market.id ? "active" : ""} onClick={() => setActiveF1Market(market.id)}>{market.title}</button>)}</div>)}</div>
            <article className="f1-market-display">
              <div className="f1-display-head"><span>{currentF1Market.id === "h2h" ? "H2H" : currentF1Market.id === "pole" ? "P1" : "◆"}</span><div><small>{currentF1Market.section}</small><h2>{currentF1Market.title}</h2></div><b>{currentF1Market.options.length} opções</b></div>
              {renderF1Options(currentF1Market)}
            </article>
          </div>
        </section>}

        <aside className="slip">
          <div className="slip-title"><span>★</span><h2>SEU BILHETE</h2><span>★</span></div>
          <div className="slip-paper">
            <div className="mode-toggle"><button className={ticketMode === "singles" ? "active" : ""} onClick={() => { setTicketMode("singles"); setSelectionWarning(""); setCopiedId(""); }}>SEPARADAS</button><button className={ticketMode === "multiple" ? "active" : ""} onClick={selectMultipleMode}>MÚLTIPLA</button></div>
            {selectionWarning && <div className="selection-warning" role="alert">ⓘ {selectionWarning}</div>}
            <div className="slip-type">{selections.length ? `${ticketMode === "multiple" ? "MÚLTIPLA" : "SEPARADAS"} · ${selections.length} SELEÇÕES` : "BILHETE VAZIO"}</div>
            <div className="selections">
              {!selections.length && <div className="empty-slip"><strong>Escolha seu primeiro palpite</strong><span>As seleções aparecerão aqui.</span></div>}
              {selections.map((item, index) => <div className={`selection ${ticketMode === "singles" ? "with-stake" : ""}`} key={item.id}><span className="selection-number">{index + 1}</span><div><strong>{item.market} — {item.pick}</strong><small>{item.game}</small>{ticketMode === "singles" && <label className="single-stake">£ <input aria-label={`Valor de ${item.pick}`} inputMode="decimal" value={singleStakes[item.id] ?? ""} onChange={(e) => setSingleStakes((current) => ({ ...current, [item.id]: e.target.value.replace(/[^0-9,.]/g, "") }))} /></label>}</div><b>{fmtOdd(item.odd)}</b><button aria-label={`Remover ${item.pick}`} onClick={() => setSelections((current) => current.filter((selection) => selection.id !== item.id))}>×</button></div>)}
            </div>
            <div className="perforation" />
            {ticketMode === "multiple" && <><div className="slip-total"><span>ODD TOTAL</span><strong>★ &nbsp; {selections.length ? fmtOdd(totalOdd) : "—"} &nbsp; ★</strong></div><label className="stake-label" htmlFor="stake">VALOR DA MÚLTIPLA</label><div className="stake"><span>£</span><input id="stake" inputMode="decimal" value={stake} onChange={(e) => setStake(e.target.value.replace(/[^0-9,.]/g, ""))} /></div></>}
            {ticketMode === "singles" && <div className="slip-total"><span>TOTAL APOSTADO</span><strong>£ {money(totalStake)}</strong></div>}
            <div className="return"><span>RETORNO POTENCIAL</span><strong>£ {money(returnValue)}</strong></div>
            <button className="discord-button" disabled={!ticketValid} onClick={copyTicket}>{copiedId ? `✓ COPIADO · #${copiedId}` : "GERAR TICKET PARA DISCORD"}</button>
            <p className="notice">ⓘ Guarde o ID para conferência.</p>
          </div>
        </aside>
      </div>

      {adminOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setAdminOpen(false); }}>
        {!adminUnlocked ? <section className="password-modal" role="dialog" aria-modal="true" aria-labelledby="password-title">
          <button className="modal-close password-close" aria-label="Fechar painel" onClick={() => setAdminOpen(false)}>×</button><div className="lock-mark">BB</div><p className="eyebrow">ÁREA RESTRITA</p><h2 id="password-title">SENHA DO ADM</h2><p>Digite a senha única para acessar jogos e tickets.</p>
          <label>Senha<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submitPassword(); }} /></label>
          {passwordError && <span className="password-error">{passwordError}</span>}<button className="primary-button unlock-button" onClick={submitPassword}>ENTRAR</button>
        </section> : <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-title">
          <div className="admin-head"><div><p className="eyebrow">ÁREA DE CONTROLE</p><h2 id="admin-title">PAINEL DO ADM</h2></div><button className="modal-close" aria-label="Fechar painel" onClick={() => setAdminOpen(false)}>×</button></div>
          <div className="admin-tabs"><button className={adminTab === "round" ? "active" : ""} onClick={() => setAdminTab("round")}>FUTEBOL</button><button className={adminTab === "f1" ? "active" : ""} onClick={() => setAdminTab("f1")}>FÓRMULA 1</button><button className={adminTab === "tickets" ? "active" : ""} onClick={() => setAdminTab("tickets")}>CONFERIR TICKETS <span>{savedTickets.length}</span></button></div>
          {adminTab === "round" ? <><p className="admin-intro">Cadastre os confrontos e defina as odds da rodada.</p><div className="admin-games">{games.map((game, index) => <article className="admin-game" key={game.id}><div className="admin-game-title"><strong>JOGO {String(index + 1).padStart(2, "0")}</strong><button onClick={() => setGames((current) => current.filter((item) => item.id !== game.id))}>REMOVER</button></div><div className="admin-fields teams-fields"><label>Mandante<input value={game.home} onChange={(e) => updateGame(game.id, "home", e.target.value)} /></label><label>Sigla<input maxLength={4} value={game.homeShort} onChange={(e) => updateGame(game.id, "homeShort", e.target.value.toUpperCase())} /></label><label>Visitante<input value={game.away} onChange={(e) => updateGame(game.id, "away", e.target.value)} /></label><label>Sigla<input maxLength={4} value={game.awayShort} onChange={(e) => updateGame(game.id, "awayShort", e.target.value.toUpperCase())} /></label></div><div className="odds-heading">ODDS DE VENCEDOR E AMBAS MARCAM</div><div className="admin-fields base-odds-fields">{[["home", "Mandante"], ["away", "Visitante"], ["bttsYes", "Ambas: sim"], ["bttsNo", "Ambas: não"]].map(([field, label]) => <label key={field}>{label}<input type="number" min="1" step="0.01" value={game.odds[field as "home" | "away" | "bttsYes" | "bttsNo"]} onChange={(e) => updateGame(game.id, `odds.${field}`, e.target.value)} /></label>)}</div><div className="odds-heading">ODDS POR PLACAR EXATO</div><div className="admin-fields odds-fields">{SCORE_OPTIONS.map((scoreOption) => <label key={scoreOption}>{scoreOption.replace("x", " × ")}<input type="number" min="1" step="0.01" value={game.odds.exactScores[scoreOption]} onChange={(e) => setGames((current) => current.map((item) => item.id === game.id ? { ...item, odds: { ...item.odds, exactScores: { ...item.odds.exactScores, [scoreOption]: Number(e.target.value) || 0 } } } : item))} /></label>)}</div></article>)}</div></> : adminTab === "f1" ? <div className="f1-admin"><p className="admin-intro">Edite o evento, os pilotos, as equipes e as odds. Os pares de head-to-head já estão agrupados.</p><label className="event-field">Nome do evento<input value={f1.eventName} onChange={(e) => setF1((current) => ({ ...current, eventName: e.target.value.toUpperCase() }))} /></label><div className="admin-games">{f1.markets.map((market) => <article className="admin-game" key={market.id}><div className="admin-game-title"><strong>{market.section} · {market.title}</strong></div><div className="f1-admin-options">{market.options.map((option) => <div className="f1-admin-option" key={option.id}><label>Opção<input value={option.label} onChange={(e) => updateF1Option(market.id, option.id, "label", e.target.value)} /></label><label>Odd<input type="number" min="1" step="0.01" value={option.odd} onChange={(e) => updateF1Option(market.id, option.id, "odd", e.target.value)} /></label>{option.group && <small>Grupo: {option.group}</small>}</div>)}</div></article>)}</div></div> : <div className="tickets-panel"><div className="ticket-search"><label htmlFor="ticket-id">VALIDAR ID NUMÉRICO</label><input id="ticket-id" inputMode="numeric" placeholder="16 dígitos" maxLength={16} value={ticketSearch} onChange={(e) => setTicketSearch(e.target.value.replace(/\D/g, ""))} /></div>{ticketSearch && <div className={decodedTicket ? "decoded-ticket valid" : "decoded-ticket invalid"}>{decodedTicket ? <><strong>✓ ID VÁLIDO</strong><div><span>Tipo<b>{decodedTicket.mode}</b></span><span>Odd<b>{fmtOdd(decodedTicket.odd)}</b></span><span>Valor<b>£ {money(decodedTicket.value)}</b></span></div></> : <><strong>✕ ID INVÁLIDO</strong><p>Confira os 16 dígitos. O checksum não corresponde.</p></>}</div>}<div className="ticket-list">{filteredTickets.map((ticket) => <article className="saved-ticket" key={ticket.id}><div className="saved-ticket-head"><strong>#{ticket.id}</strong><span className={ticket.status}>{ticket.status}</span></div><div className="saved-ticket-meta"><span>{ticket.mode === "multiple" ? "Múltipla" : "Separadas"}</span><span>{ticket.selections.length} seleções</span><span>£ {money(ticket.totalStake)}</span><span>{new Date(ticket.createdAt).toLocaleString("pt-BR")}</span></div>{ticket.selections.map((item) => <p key={item.id}>{item.game} — {item.pick} @{fmtOdd(item.odd)}</p>)}<div className="saved-ticket-footer"><strong>Retorno: £ {money(ticket.potentialReturn)}</strong><button onClick={() => updateTicketStatus(ticket.id)}>{ticket.status === "pendente" ? "MARCAR CONFERIDO" : "REABRIR"}</button></div></article>)}</div></div>}
          {adminTab === "round" && <div className="admin-footer"><button className="secondary-button" onClick={addGame}>+ ADICIONAR JOGO</button><div className="admin-save-group">{adminMessage && <span>{adminMessage}</span>}<button className="secondary-button" onClick={copyGamesJson}>COPIAR JSON</button><button className="primary-button" onClick={saveGames}>SALVAR RODADA</button></div></div>}
          {adminTab === "f1" && <div className="admin-footer"><span>As alterações ficam neste navegador.</span><div className="admin-save-group">{adminMessage && <span>{adminMessage}</span>}<button className="primary-button" onClick={saveF1}>SALVAR FÓRMULA 1</button></div></div>}
        </section>}
      </div>}
    </main>
  );
}
