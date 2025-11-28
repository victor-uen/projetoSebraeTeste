import { useState, useEffect } from 'react';
import axios from 'axios';

// Seus imports de SVG e Imagens (mantidos do seu original)
import svgPaths from "./imports/svg-90ghx3pzlm";
import imgProgramacao2048X1367Jpg2 from "./assets/profile-pic.png";
import imgGoldMedal7449841 from "./assets/gold-medal.png";
import imgTechBrandWorkingSustainabilityGoals1 from "./assets/hero-background.png";
import imgSebrae111 from "./assets/sebrae-logo.png";
import { imgProgramacao2048X1367Jpg1, imgGroup, imgGroup1, imgGroup2 } from "./imports/svg-vxbk4";


// ==========================================================
// 1. DEFINIÇÕES DE TIPOS (Frontend e Backend)
// ==========================================================

type FilterType = 'Todos' | 'Conteúdo' | 'Plataforma' | 'Instrutor' | 'Atendimento';

// Esta é a interface que o SEU DESIGN (UI) espera
interface FeedbackUI {
    id: number;
    title: string;
    description: string;
    author: string;
    date: string;
    comments: number;
    // 'votes' será gerenciado pelo estado 'votes'
    category: string;
    tag: string;
    status: 'Em Análise' | 'Implementado' | 'Pendente'; // Adicionado Pendente
    statusColor: string;
}

interface CommentUI {
    id: number;
    text: string;
    author: string;
}

// --- Tipos que vêm da API (Java) ---
// Precisamos "traduzir" disso...
interface ApiUsuario {
    idUser: number;
    name_user: string;
    password?: string;
}

interface ApiComentario {
    idComentario: number;
    mensagem: string;
    data: string;
}

interface ApiFeedback {
    idFeedback: number;
    titulo: string;
    usuario: ApiUsuario;
    categoria: 'Conteudo' | 'Instrutor' | 'Plataforma' | 'Atendimento';
    curso: 'Gestao_Financeira' | 'Marketing_Digital' | 'Empreendedorismo' | 'Gestao_de_Pessoas' | 'Vendas' | 'Inovacao';
    mensagem: string;
    data: string; // Vem como "2025-11-10T20:30:00"
    status: 'Implementado' | 'Em_analise' | 'Pendente';
    comentarios: ApiComentario[];
}

// ==========================================================
// 2. FUNÇÕES "TRADUTORAS" (Mapeamento)
// ==========================================================

// Traduz o Status da API para o formato do UI
function formatStatus(status: ApiFeedback['status']): FeedbackUI['status'] {
    switch (status) {
        case 'Em_analise':
            return 'Em Análise';
        case 'Implementado':
            return 'Implementado';
        case 'Pendente':
            return 'Pendente';
        default:
            return 'Pendente';
    }
}

// Traduz o Curso da API para a Tag do UI
function formatTag(curso: ApiFeedback['curso']): string {
    return curso.replace(/_/g, ' '); // Troca "Gestao_Financeira" por "Gestao Financeira"
}

// Traduz a Categoria da API para a Categoria do UI
function formatCategory(categoria: ApiFeedback['categoria']): string {
    if (categoria === 'Conteudo') return 'Conteúdo'; // Ajusta acentuação
    return categoria;
}

// Define a cor baseada no Status do UI
function getStatusColor(status: FeedbackUI['status']): string {
    switch (status) {
        case 'Em Análise':
            return '#f0c43f'; // Amarelo
        case 'Implementado':
            return '#28a745'; // Verde
        case 'Pendente':
            return '#6c757d'; // Cinza
        default:
            return '#6c757d';
    }
}

// Formata a data (ex: "2025-11-10T20:30:00" -> "10/11/2025")
function formatDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    } catch (e) {
        return 'Data inválida';
    }
}

function mapApiCommentToUI(apiComment: ApiComentario): CommentUI {
    return {
        id: apiComment.idComentario,
        text: apiComment.mensagem,
        author: 'Usuário anônimo', // A API de comentário não informa o autor
    };
}

// O TRADUTOR PRINCIPAL: Converte um Feedback da API para um Feedback do UI
function mapApiFeedbackToUI(apiFeedback: ApiFeedback): FeedbackUI {
    const uiStatus = formatStatus(apiFeedback.status);

    return {
        id: apiFeedback.idFeedback,
        title: apiFeedback.titulo,
        description: apiFeedback.mensagem,
        author: apiFeedback.usuario ? apiFeedback.usuario.name_user : 'Usuário anônimo',
        date: formatDate(apiFeedback.data),
        comments: apiFeedback.comentarios ? apiFeedback.comentarios.length : 0,
        category: formatCategory(apiFeedback.categoria),
        tag: formatTag(apiFeedback.curso),
        status: uiStatus,
        statusColor: getStatusColor(uiStatus),
    };
}


// ==========================================================
// 3. O COMPONENTE APP
// ==========================================================
export default function App() {
    const [feedbacks, setFeedbacks] = useState<FeedbackUI[]>([]); // 👈 Estado para os feedbacks da API
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('Todos');
    const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

    // O estado de votos agora é inicializado vazio
    const [votes, setVotes] = useState<Record<number, number>>({});
    const [comments, setComments] = useState<Record<number, CommentUI[]>>({});

    // URL da sua API (assumindo que o Spring Boot roda na porta 8080)
    const API_URL = "";

    // 🔴 Efeito para buscar dados da API quando o componente carregar
    useEffect(() => {
        async function fetchFeedbacks() {
            try {
                const response = await axios.get<ApiFeedback[]>(`${API_URL}/api/feedbacks`);

                // "Traduz" os dados da API para o formato do UI
                const uiData = response.data.map(mapApiFeedbackToUI);

                // Alimenta o estado de feedbacks
                setFeedbacks(uiData);

                // Inicializa o estado de votos (com 0 votos para cada)
                const initialVotes = uiData.reduce((acc, fb) => {
                    acc[fb.id] = 0; // A API ainda não retorna votos, então começamos com 0
                    return acc;
                }, {} as Record<number, number>);

                setVotes(initialVotes);

            } catch (error) {
                console.error("Erro ao buscar feedbacks:", error);
            }
        }

        fetchFeedbacks();
    }, []); // O array vazio [] faz com que isso rode apenas UMA vez

    const filteredFeedbacks = feedbacks.filter(fb =>
        selectedFilter === 'Todos' || fb.category === selectedFilter
    );

    const handleVote = (id: number) => {
        setVotes(prev => {
            const currentVotes = prev[id] || 0;
            return {
                ...prev,
                [id]: currentVotes + 1
            };
        });
        // FUTURO: Aqui você faria uma chamada (PUT/POST) para a API para salvar o voto
    };

    const toggleComments = async (id: number) => {
        const newExpanded = new Set(expandedComments);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
            if (!comments[id]) { // Busca comentários apenas se já não foram buscados
                try {
                    const response = await axios.get<ApiComentario[]>(`${API_URL}/comentarios/feedback/${id}`);
                    const uiComments = response.data.map(mapApiCommentToUI);
                    setComments(prev => ({ ...prev, [id]: uiComments }));
                } catch (error) {
                    console.error(`Erro ao buscar comentários para o feedback ${id}:`, error);
                    // Opcional: guardar um estado de erro para este feedback
                }
            }
        }
        setExpandedComments(newExpanded);
    };

    const handleAvalieAgora = () => {
        alert('Avalie Agora! Em breve você poderá enviar seu feedback.');
    };

    const filters: FilterType[] = ['Todos', 'Conteúdo', 'Plataforma', 'Instrutor', 'Atendimento'];

    //
    // 💎 ABAIXO ESTÁ O SEU JSX ORIGINAL, AGORA CORRIGIDO E LIMPO 💎
    //
    return (
        <div className="bg-[#ddddf5] min-h-screen p-8">
            {/* Header */}
            <div className="bg-white max-w-[1328px] mx-auto rounded-[16px] shadow-[0px_4px_20px_0px_rgba(233,240,243,0.8)] p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-16">
                        <img src={imgSebrae111} alt="SEBRAE" className="h-[80px]" />
                        <nav className="flex gap-12">
                            <button className="relative">
                <span className="font-['Open_Sans:SemiBold',sans-serif] text-[#60656a] text-[20px]">
                  Fala Sebrae
                </span>
                                <div className="absolute -bottom-2 left-0 w-full h-[4px] bg-[#006DB4] rounded-full" />
                            </button>
                            <button className="font-['Open_Sans:SemiBold',sans-serif] text-[#60656a] text-[20px] hover:text-[#006DB4] transition-colors">
                                Meus Feedbacks
                            </button>
                            <button className="font-['Open_Sans:SemiBold',sans-serif] text-[#60656a] text-[20px] hover:text-[#006DB4] transition-colors">
                                Gestores Públicos
                            </button>
                            <button className="font-['Open_Sans:SemiBold',sans-serif] text-[#60656a] text-[20px] hover:text-[#006DB4] transition-colors">
                                Empreendedores
                            </button>
                            <button className="font-['Open_Sans:SemiBold',sans-serif] text-[#60656a] text-[20px] hover:text-[#006DB4] transition-colors">
                                Atendimento
                            </button>
                             <div className="relative inline-block text-left">
                                <button className="font-['Open_Sans:SemiBold',sans-serif] text-[#60656a] text-[20px] hover:text-[#006DB4] transition-colors">
                                    Gerenciamento
                                </button>
                                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                    <div className="py-1" role="none">
                                        <a href="/usuarios.html" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Gerenciar Usuários</a>
                                        <a href="/feedbacks.html" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Gerenciar Feedbacks</a>
                                        <a href="/comentarios.html" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Gerenciar Comentários</a>
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
            <span className="font-['Open_Sans:SemiBold',sans-serif] text-[#60656a] text-[18px]">
              Luana S.
            </span>
                        <div className="w-[50px] h-[50px] rounded-full bg-[#d9d9d9] overflow-hidden">
                            <img src={imgProgramacao2048X1367Jpg2} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Banner */}
            <div className="bg-white max-w-[1328px] mx-auto rounded-[20px] shadow-[0px_4px_60px_0px_#e9f0f3] p-12 mb-8">
                <div className="bg-gradient-to-r from-[#a0a2f5] to-[#4648b8] rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] p-12 relative overflow-hidden">
                    <img
                        src={imgTechBrandWorkingSustainabilityGoals1}
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover opacity-35 rounded-[10px]"
                    />
                    <div className="relative z-10 flex items-center gap-12">
                        <div className="flex-shrink-0">
                            <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-lg">
                                <text x="50%" y="35%" textAnchor="middle" className="font-['Open_Sans:Bold',sans-serif] text-[48px] fill-white">
                                    Fala
                                </text>
                                <text x="50%" y="60%" textAnchor="middle" className="font-['Open_Sans:Bold',sans-serif] text-[48px] fill-white">
                                    SEBRAE
                                </text>
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="font-['Open_Sans:SemiBold',sans-serif] text-[64px] text-[#84f3bc] mb-2">
                                Opine.
                            </p>
                            <p className="font-['Open_Sans:Bold',sans-serif] text-[64px] text-[#006db4] mb-2">
                                Construa.
                            </p>
                            <p className="font-['Open_Sans:SemiBold',sans-serif] text-[64px] text-[#f3f6fc]">
                                Empreenda.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Ranking Semanal (ESTÁTICO POR ENQUANTO) */}
                <div className="mt-12">
                    <div className="flex items-center gap-4 mb-6">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <path d={svgPaths.p12ee7f00} fill="#F3F6FC" />
                        </svg>
                        <h2 className="font-['Open_Sans:SemiBold',sans-serif] text-[#f3f6fc] text-[28.667px]">
                            Ranking Semanal
                        </h2>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { title: 'Exemplos práticos para aulas de gestão financeira', time: '2min', votes: 43, tag: 'Gestão Financeira' },
                            { title: 'Plataforma lenta demais', time: '4min', votes: 42, tag: 'Problemas Técnicos' },
                            { title: 'Falta de material complementar', time: '4min', votes: 37, tag: 'Problemas Técnicos' }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-[#f3f6fc] rounded-[12.811px] shadow-[0px_3.843px_6.405px_0px_rgba(165,192,205,0.3)] p-6 hover:shadow-lg transition-shadow cursor-pointer">
                                <h3 className="font-['Open_Sans:SemiBold',sans-serif] text-[15px] text-[#040608] mb-3 line-clamp-2">
                                    {item.title}
                                </h3>
                                <p className="font-['Open_Sans:Regular',sans-serif] text-[12px] text-[#040608] mb-4 line-clamp-3">
                                    {idx === 0 && 'Seria muito útil ter mais exemplos práticos durante as aulas sobre gestão financeira. Os casos reais ajudam muito na compreensão.'}
                                    {idx === 1 && 'A plataforma está muito lenta ao carregar os vídeos. Seria possível otimizar o carregamento?'}
                                    {idx === 2 && 'O instrutor explica de forma muito clara, mas sinto falta de materiais complementares para download.'}
                                </p>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex items-center gap-2 text-[#60656a]">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path d={svgPaths.p2e36e700} fill="#60656A" />
                                        </svg>
                                        <span className="font-['Open_Sans:SemiBold',sans-serif] text-[11.345px]">{item.time}</span>
                                    </div>
                                    <span className="border border-[#545cfe] text-[#545cfe] px-2 py-1 rounded-[12.314px] text-[11.084px]">
                    {item.tag}
                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[#4648b8]">
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                            <path d={svgPaths.pc9b0600} fill="#4648B8" />
                                        </svg>
                                        <span className="font-['Open_Sans:SemiBold',sans-serif] text-[13px]">{item.votes} votos</span>
                                    </div>
                                    <button
                                        className="bg-[#4648b8] rounded-full w-[36px] h-[36px] flex items-center justify-center hover:bg-[#3638a0] hover:scale-110 transition-all shadow-md"
                                        aria-label="Vote"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="transform translate-y-[-1px]">
                                            <path d={svgPaths.p2d9e2c80} fill="#F3F6FC" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Atualizações Semanais (ESTÁTICO POR ENQUANTO) */}
            <div className="max-w-[1328px] mx-auto mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d={svgPaths.p25721b00} fill="#585EFD" />
                    </svg>
                    <h2 className="font-['Open_Sans:SemiBold',sans-serif] text-[#60656a] text-[28.667px]">
                        Atualizações Semanais
                    </h2>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {[
                        { time: '2min', title: 'Novo sistema de notificações implementado', description: 'Agora você receberá atualizações em tempo real sobre o status dos seus feedbacks.' },
                        { time: '5min', title: 'Novo sistema de notificações implementado', description: 'Agora você receberá atualizações em tempo real sobre o status dos seus feedbacks.' },
                        { time: '3min', title: 'Novo sistema de notificações implementado', description: 'Agora você receberá atualizações em tempo real sobre o status dos seus feedbacks.' }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-[#fafbff] rounded-[18.818px] border border-[#dadae1] shadow-[0px_5.645px_9.409px_0px_rgba(165,192,205,0.3)] p-6 hover:shadow-lg transition-shadow">
                            <h3 className="font-['Open_Sans:SemiBold',sans-serif] text-[16.936px] text-[#040608] mb-4">
                                {item.title}
                            </h3>
                            <p className="font-['Open_Sans:Regular',sans-serif] text-[13.173px] text-[#040608] mb-4 min-h-[40px]">
                                {item.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[#60656a]">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d={svgPaths.p28884400} fill="#60656A" />
                                    </svg>
                                    <span className="font-['Open_Sans:SemiBold',sans-serif] text-[15.055px]">{item.time}</span>
                                </div>
                                <button className="bg-[#4648b8] rounded-full w-[34px] h-[34px] flex items-center justify-center hover:bg-[#3638a0] hover:scale-110 transition-all shadow-md">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transform translate-x-[1px]">
                                        <path d={svgPaths.p3affa000} fill="white" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mural de Feedbacks (DINÂMICO) */}
            <div className="bg-[#b8ffdb] max-w-[1328px] mx-auto rounded-[20px] shadow-[0px_7px_21.1px_10px_#f8f8ff] p-12 relative">
                <div className="flex items-center gap-4 mb-8">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d={svgPaths.p3a5f3100} fill="#545CFE" />
                    </svg>
                    <h2 className="font-['Open_Sans:SemiBold',sans-serif] text-[#60656a] text-[28.667px]">
                        Mural de Feedbacks
                    </h2>
                </div>

                {/* Filtros */}
                <div className="flex gap-4 mb-8">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setSelectedFilter(filter)}
                            className={`px-[19.8px] py-[7.92px] rounded-[15px] font-['Open_Sans:Bold',sans-serif] text-[19.8px] transition-all ${
                                selectedFilter === filter
                                    ? 'bg-[#4648b8] text-white shadow-md'
                                    : 'bg-[#fafbff] text-[#4648b8] border border-[#4648b8] hover:bg-[#4648b8] hover:text-white'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Feedback Items (Vindos da API) */}
                <div className="space-y-6">
                    {filteredFeedbacks.map((feedback) => (
                        <div key={feedback.id} className="bg-[#f3f6fc] rounded-[19px] shadow-[6px_5px_7.2px_3px_rgba(0,0,0,0.25)] p-8 hover:shadow-2xl transition-shadow">
                            <div className="flex gap-6">
                                <button
                                    onClick={() => handleVote(feedback.id)}
                                    className="flex-shrink-0 hover:scale-110 transition-transform"
                                >
                                    <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                                        <path d={svgPaths.p102e9000} fill="#545CFE" />
                                    </svg>
                                    <p className="font-['Open_Sans:Regular',sans-serif] text-[20.429px] text-[#040608] text-center mt-2">
                                        {votes[feedback.id] || 0}
                                    </p>
                                </button>

                                <div className="flex-1">
                                    <h3 className="font-['Open_Sans:SemiBold',sans-serif] text-[20px] text-[#040608] mb-4">
                                        {feedback.title}
                                    </h3>
                                    <p className="font-['Open_Sans:Regular',sans-serif] text-[16px] text-[#040608] mb-4">
                                        {feedback.description}
                                    </p>

                                    <div className="flex items-center gap-4 mb-4">
                    <span className="font-['Open_Sans:Regular',sans-serif] text-[12px] text-[#040608]">
                      {feedback.author}
                    </span>
                                        <span className="text-[12px] text-[#040608]">•</span>
                                        <span className="font-['Open_Sans:Regular',sans-serif] text-[12px] text-[#040608]">
                      {feedback.date}
                    </span>
                                        <span className="text-[12px] text-[#040608]">•</span>
                                        <button
                                            onClick={() => toggleComments(feedback.id)}
                                            className="flex items-center gap-2 hover:text-[#4648b8] transition-colors"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d={svgPaths.p3402c480} fill="#040608" />
                                            </svg>
                                            <span className="font-['Open_Sans:Regular',sans-serif] text-[12px] text-[#040608]">
                        {feedback.comments} comentários
                      </span>
                                        </button>
                                    </div>

                                    <div className="flex gap-2">
                    <span className="border border-[#545cfe] text-[#545cfe] px-[9.558px] py-[7.646px] rounded-[21.328px] text-[19.198px]">
                      {feedback.category}
                    </span>
                                        <span className="border border-[#545cfe] text-[#545cfe] px-[9.558px] py-[7.646px] rounded-[21.328px] text-[19.198px]">
                      {feedback.tag}
                    </span>
                                        <span
                                            className="px-[9.558px] py-[7.646px] rounded-[21.328px] text-[19.198px]"
                                            style={{
                                                backgroundColor: feedback.statusColor,
                                                color: feedback.status === 'Implementado' ? '#f0f0f8' : '#040608'
                                            }}
                                        >
                      {feedback.status}
                    </span>
                                    </div>

                                    {expandedComments.has(feedback.id) && (
                                        <div className="mt-4 p-4 bg-white rounded-lg">
                                            {comments[feedback.id] ? (
                                                comments[feedback.id].length > 0 ? (
                                                    comments[feedback.id].map(comment => (
                                                        <div key={comment.id} className="border-b last:border-b-0 py-2">
                                                            <p className="text-[14px] text-[#333]">{comment.text}</p>
                                                            <p className="text-[12px] text-[#888] mt-1">- {comment.author}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-[14px] text-[#60656a]">Nenhum comentário ainda.</p>
                                                )
                                            ) : (
                                                <p className="text-[14px] text-[#60656a]">Carregando comentários...</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Botão Avalie Agora */}
                <button
                    onClick={handleAvalieAgora}
                    className="fixed bottom-8 right-8 bg-[#4648b8] px-[23.641px] py-[9.038px] rounded-[25.211px] shadow-[0px_3.039px_4.558px_0px_rgba(0,0,0,0.25)] flex items-center gap-3 hover:bg-[#3638a0] transition-all hover:scale-105"
                >
                    <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                        <path d={svgPaths.p14277400} fill="white" />
                    </svg>
                    <span className="font-['Open_Sans:SemiBold',sans-serif] text-[22.693px] text-white">
            Avalie Agora
          </span>
                </button>
            </div>
        </div>
    );
}