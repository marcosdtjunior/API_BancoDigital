let { banco, contas, identificadorConta, saques, depositos, transferencias } = require('../bancodedados');

const listarContas = (req, res) => {
    const { senha_banco } = req.query;

    if (!senha_banco) {
        return res.status(403).json({ mensagem: 'É necessário informar a senha do banco!' });
    }

    if (senha_banco !== banco.senha) {
        return res.status(401).json({ mensagem: 'A senha do banco informada é inválida!' });
    }

    return res.status(200).json(contas);
}

const criarConta = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({
            mensagem: `Todos os seguintes campos devem ser informados: Nome, CPF, data de nascimento, telefone, e-mail e senha.`
        });
    }

    for (let conta of contas) {
        if (conta.usuario.cpf === cpf) {
            return res.status(400).json({ mensagem: 'Já existe uma conta com o CPF informado!' });
        }

        if (conta.usuario.email === email) {
            return res.status(400).json({ mensagem: 'Já existe uma conta com o e-mail informado!' });
        }
    }

    const conta = {
        numero: String(identificadorConta++),
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }

    contas.push(conta);

    return res.status(201).send();
}

const atualizarDadosUsuario = (req, res) => {
    const { numeroConta } = req.params;
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    const contaEncontrada = contas.find((conta) => {
        return conta.numero === numeroConta;
    });

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: 'Conta não encontrada!' });
    }

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({
            mensagem: `Todos os seguintes campos devem ser informados: Nome, CPF, data de nascimento, telefone, e-mail e senha.`
        });
    }

    for (let conta of contas) {
        if (conta.usuario.cpf === cpf) {
            return res.status(400).json({ mensagem: 'O CPF informado já está cadastrado!' });
        }

        if (conta.usuario.email === email) {
            return res.status(400).json({ mensagem: 'O e-mail informado já está cadastrado!' });
        }
    }

    contaEncontrada.usuario.nome = nome;
    contaEncontrada.usuario.cpf = cpf;
    contaEncontrada.usuario.data_nascimento = data_nascimento;
    contaEncontrada.usuario.telefone = telefone;
    contaEncontrada.usuario.email = email;
    contaEncontrada.usuario.senha = senha;

    return res.status(204).send();
}

const excluirConta = (req, res) => {
    const { numeroConta } = req.params;

    const contaEncontrada = contas.find((conta) => {
        return conta.numero === numeroConta;
    });

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: 'Conta não encontrada!' });
    }

    if (contaEncontrada.saldo > 0) {
        return res.status(400).json({ mensagem: 'A conta só pode ser removida se o saldo for zero!' });
    }

    contas = contas.filter((conta) => {
        return conta.numero !== numeroConta;
    });

    return res.status(204).send();
}

const consultarSaldo = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: 'É necessário informar o número da conta e a senha!' });
    }

    const contaEncontrada = contas.find((conta) => {
        return conta.numero === numero_conta;
    });

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: 'Conta não encontrada!' });
    }

    if (contaEncontrada.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'A senha da conta está incorreta!' });
    }

    return res.status(200).json({ saldo: contaEncontrada.saldo });
}

const emitirExtrato = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: 'É necessário informar o número da conta e a senha!' });
    }

    const contaEncontrada = contas.find((conta) => {
        return conta.numero === numero_conta;
    });

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: 'Conta não encontrada!' });
    }

    if (contaEncontrada.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'A senha da conta está incorreta!' });
    }

    const depositosFiltrados = depositos.filter((deposito) => {
        return deposito.numero_conta === contaEncontrada.numero;
    });

    const saquesFiltrados = saques.filter((saque) => {
        return saque.numero_conta === contaEncontrada.numero;
    });

    const transferenciasEnviadas = transferencias.filter((transferencia) => {
        return transferencia.numero_conta_origem === contaEncontrada.numero;
    });

    const transferenciasRecebidas = transferencias.filter((transferencia) => {
        return transferencia.numero_conta_destino === contaEncontrada.numero;
    });

    const extrato = { depositos: depositosFiltrados, saques: saquesFiltrados, transferenciasEnviadas, transferenciasRecebidas };

    return res.status(200).json(extrato);
}

module.exports = {
    listarContas,
    criarConta,
    atualizarDadosUsuario,
    excluirConta,
    consultarSaldo,
    emitirExtrato
}