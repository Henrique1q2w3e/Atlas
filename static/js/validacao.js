// Validações do formulário de checkout
function validarEmail(email) {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
}

function validarCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^0-9]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do CPF
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

function validarTelefone(telefone) {
    // Remove caracteres não numéricos
    telefone = telefone.replace(/[^0-9]/g, '');
    
    // Verifica se tem 10 ou 11 dígitos
    if (telefone.length !== 10 && telefone.length !== 11) return false;
    
    // Verifica se começa com DDD válido (11-99)
    const ddd = parseInt(telefone.substring(0, 2));
    return ddd >= 11 && ddd <= 99;
}

function mostrarErro(campo, mensagem) {
    // Remove erro anterior
    const erroAnterior = document.querySelector(`#${campo}-erro`);
    if (erroAnterior) {
        erroAnterior.remove();
    }
    
    // Adiciona novo erro
    const input = document.getElementById(campo);
    const erro = document.createElement('div');
    erro.id = `${campo}-erro`;
    erro.className = 'text-danger mt-1';
    erro.innerHTML = `<small>❌ ${mensagem}</small>`;
    input.parentNode.appendChild(erro);
    
    // Destaca o campo
    input.classList.add('is-invalid');
}

function removerErro(campo) {
    const erro = document.querySelector(`#${campo}-erro`);
    if (erro) {
        erro.remove();
    }
    
    const input = document.getElementById(campo);
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
}

function validarFormulario() {
    let valido = true;
    
    // Validar email
    const email = document.getElementById('email').value;
    if (!validarEmail(email)) {
        mostrarErro('email', 'Email inválido');
        valido = false;
    } else {
        removerErro('email');
    }
    
    // Validar CPF (se preenchido)
    const cpf = document.getElementById('cpf').value;
    if (cpf && !validarCPF(cpf)) {
        mostrarErro('cpf', 'CPF inválido');
        valido = false;
    } else if (cpf) {
        removerErro('cpf');
    }
    
    // Validar telefone (se preenchido)
    const telefone = document.getElementById('telefone').value;
    if (telefone && !validarTelefone(telefone)) {
        mostrarErro('telefone', 'Telefone inválido');
        valido = false;
    } else if (telefone) {
        removerErro('telefone');
    }
    
    return valido;
}

// Adicionar validação em tempo real
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const cpfInput = document.getElementById('cpf');
    const telefoneInput = document.getElementById('telefone');
    
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !validarEmail(this.value)) {
                mostrarErro('email', 'Email inválido');
            } else if (this.value) {
                removerErro('email');
            }
        });
    }
    
    if (cpfInput) {
        cpfInput.addEventListener('blur', function() {
            if (this.value && !validarCPF(this.value)) {
                mostrarErro('cpf', 'CPF inválido');
            } else if (this.value) {
                removerErro('cpf');
            }
        });
        
        // Formatar CPF
        cpfInput.addEventListener('input', function() {
            let value = this.value.replace(/[^0-9]/g, '');
            if (value.length >= 3) {
                value = value.substring(0, 3) + '.' + value.substring(3);
            }
            if (value.length >= 7) {
                value = value.substring(0, 7) + '.' + value.substring(7);
            }
            if (value.length >= 11) {
                value = value.substring(0, 11) + '-' + value.substring(11);
            }
            this.value = value;
        });
    }
    
    if (telefoneInput) {
        telefoneInput.addEventListener('blur', function() {
            if (this.value && !validarTelefone(this.value)) {
                mostrarErro('telefone', 'Telefone inválido');
            } else if (this.value) {
                removerErro('telefone');
            }
        });
        
        // Formatar telefone
        telefoneInput.addEventListener('input', function() {
            let value = this.value.replace(/[^0-9]/g, '');
            if (value.length >= 2) {
                value = '(' + value.substring(0, 2) + ') ' + value.substring(2);
            }
            if (value.length >= 10) {
                value = value.substring(0, 10) + '-' + value.substring(10);
            }
            this.value = value;
        });
    }
});
