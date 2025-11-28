import { useState, useEffect } from "react";
import api from "../../services/api"; // pode usar seu axios configurado aqui
import "./style.css";

function Home() {
    const [helloResult, setHelloResult] = useState("");
    const [users, setUsers] = useState([]);
    const [userName, setUserName] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const [editUserName, setEditUserName] = useState("");
    const [editUserPassword, setEditUserPassword] = useState("");

    // Testar endpoint hello
    const testHello = async () => {
        try {
            const res = await api.get("/hello?name=Usuário");
            setHelloResult(res.data);
        } catch {
            setHelloResult("Erro ao testar o endpoint");
        }
    };

    // Carregar usuários
    const loadUsers = async () => {
        try {
            const res = await api.get("/api/usuarios");
            setUsers(res.data);
        } catch {
            alert("Erro ao carregar usuários");
        }
    };

    // Cadastrar usuário
    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post("/api/usuarios", {
                name_user: userName,
                password: userPassword,
            });
            alert("Usuário cadastrado com sucesso!");
            setUserName("");
            setUserPassword("");
            loadUsers();
        } catch {
            alert("Erro ao cadastrar usuário");
        }
    };

    // Editar usuário
    const handleEditUser = (user) => {
        setEditUserId(user.idUser);
        setEditUserName(user.name_user);
        setEditUserPassword("");
        setEditMode(true);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditUserId(null);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();

        const payload = { name_user: editUserName };
        if (editUserPassword) payload.password = editUserPassword;

        try {
            await api.put(`/api/usuarios/${editUserId}`, payload);
            alert("Usuário atualizado com sucesso!");
            setEditMode(false);
            loadUsers();
        } catch {
            alert("Erro ao atualizar usuário");
        }
    };

    // Excluir usuário
    const deleteUser = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
            try {
                await api.delete(`/api/usuarios/${id}`);
                alert("Usuário excluído com sucesso!");
                loadUsers();
            } catch {
                alert("Erro ao excluir usuário");
            }
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    return (
        <div className="body">
            <div className="container">
                <h1 className="title">Projeto 3 - Sebrae</h1>

                <div className="nav">
                    <a href="#" className="link">Gerenciar Usuários</a>
                    <a href="#" className="link">Gerenciar Feedbacks</a>
                </div>

                <div className="section">
                    <h2>Teste da API</h2>
                    <button onClick={testHello}>Testar Endpoint Hello</button>
                    <div>{helloResult}</div>
                </div>

                <div className="section">
                    <h2>Cadastrar Usuário</h2>
                    <form onSubmit={handleCreateUser}>
                        <label>Nome:</label>
                        <input
                            type="text"
                            required
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                        <label>Senha:</label>
                        <input
                            type="password"
                            required
                            value={userPassword}
                            onChange={(e) => setUserPassword(e.target.value)}
                        />
                        <button type="submit">Cadastrar</button>
                    </form>
                </div>

                <div className="section">
                    <h2>Lista de Usuários</h2>
                    <button onClick={loadUsers}>Carregar Usuários</button>
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Ações</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Array.isArray(users) && users.map((user) => (
                            <tr key={user.idUser}>
                                <td>{user.idUser}</td>
                                <td>{user.name_user}</td>
                                <td>
                                    <button
                                        onClick={() => handleEditUser(user)}
                                        className="btn-edit"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => deleteUser(user.idUser)}
                                        className="btn-delete"
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {editMode && (
                    <div className="section">
                        <h2>Editar Usuário</h2>
                        <form onSubmit={handleUpdateUser}>
                            <label>Nome:</label>
                            <input
                                type="text"
                                required
                                value={editUserName}
                                onChange={(e) => setEditUserName(e.target.value)}
                            />
                            <label>Nova Senha:</label>
                            <input
                                type="password"
                                placeholder="Deixe em branco para manter a senha atual"
                                value={editUserPassword}
                                onChange={(e) => setEditUserPassword(e.target.value)}
                            />
                            <button type="submit">Atualizar</button>
                            <button type="button" onClick={handleCancelEdit}>
                                Cancelar
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;
