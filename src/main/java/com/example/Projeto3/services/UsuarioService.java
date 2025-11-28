package com.example.Projeto3.services;

import com.example.Projeto3.entities.Usuario;
import com.example.Projeto3.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    // Criar um novo usuário
    public Usuario createUsuario(Usuario usuario) {
        // IMPORTANTE: Em um app real, você DEVE criptografar a senha aqui!
        // ex: usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    // Obter todos os usuários
    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    // Obter um usuário por ID
    public Optional<Usuario> getUsuarioById(Long id) {
        return usuarioRepository.findById(id);
    }

    // Atualizar um usuário
    public Optional<Usuario> updateUsuario(Long id, Usuario usuarioDetails) {
        Optional<Usuario> optionalUsuario = usuarioRepository.findById(id);

        if (optionalUsuario.isPresent()) {
            Usuario usuarioExistente = optionalUsuario.get();
            usuarioExistente.setName_user(usuarioDetails.getName_user());
            usuarioExistente.setPassword(usuarioDetails.getPassword()); // Lembre-se de criptografar!

            return Optional.of(usuarioRepository.save(usuarioExistente));
        } else {
            return Optional.empty(); // Retorna vazio se não encontrou
        }
    }

    // Deletar um usuário
    public boolean deleteUsuario(Long id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return true;
        }
        return false; // Não encontrou o usuário para deletar
    }
}