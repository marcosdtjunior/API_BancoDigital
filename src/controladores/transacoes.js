let { contas, saques, depositos, transferencias } = require('../bancodedados');
const { format } = require('date-fns');

const depositar = (req, res) => {
    const { numero_conta, valor } = req.body;

    if (!numero_conta || !valor) {
        return res.status(400).json({ mensagem: 'O número da conta e o valor são obrigatórios!' });
    }

    const contaEncontrada = contas.find((conta) => {
        return conta.numero === numero_conta;
    });

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: 'Conta não encontrada!' });
    }

    if (Number(valor) <= 0) {
        return res.status(400).json({ mensagem: 'Só é permitido depositar valores positivos!' });
    }

    contaEncontrada.saldo += Number(valor);

    const momentoAtual = new Date();
    const data = format(momentoAtual, "yyyy-MM-dd HH:mm:ss");

    const deposito = { data, numero_conta, valor: Number(valor) };

    depositos.push(deposito);

    return res.status(204).send();
}

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body;

    if (!numero_conta || !valor || !senha) {
        return res.status(400).json({ mensagem: 'O número da conta, o valor e a senha são obrigatórios!' });
    }

    const contaEncontrada = contas.find((conta) => {
        return conta.numero === numero_conta;
    });

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: 'Conta não encontrada!' });
    }

    if (contaEncontrada.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'A senha está incorreta!' });
    }

    if (contaEncontrada.saldo === 0) {
        return res.status(400).json({ mensagem: 'Não há saldo disponível para saque!' });
    }

    if (Number(valor) <= 0) {
        return res.status(400).json({ mensagem: 'Não é possível sacar um valor menor ou igual a zero!' });
    }

    contaEncontrada.saldo -= Number(valor);

    const momentoAtual = new Date();
    const data = format(momentoAtual, "yyyy-MM-dd HH:mm:ss");

    const saque = { data, numero_conta, valor: Number(valor) };

    saques.push(saque);

    return res.status(204).send();
}

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return res.status(400).json({ mensagem: 'O número da conta de origem, o número da conta de destino, o valor da transferência e a senha da conta de origem são obrigatórios!' });
    }

    const contaOrigem = contas.find((conta) => {
        return conta.numero === numero_conta_origem;
    });

    if (!contaOrigem) {
        return res.status(404).json({ mensagem: 'Conta de origem não encontrada!' });
    }

    const contaDestino = contas.find((conta) => {
        return conta.numero === numero_conta_destino;
    });

    if (!contaDestino) {
        return res.status(404).json({ mensagem: 'Conta de destino não encontrada!' });
    }

    if (contaOrigem.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'A senha da conta de origem está incorreta!' });
    }

    if (contaOrigem.saldo < Number(valor)) {
        return res.status(400).json({ mensagem: 'Não há saldo suficiente na conta de origem para transferência!' });
    }

    contaOrigem.saldo -= Number(valor);
    contaDestino.saldo += Number(valor);

    const momentoAtual = new Date();
    const data = format(momentoAtual, "yyyy-MM-dd HH:mm:ss");

    const transferencia = { data, numero_conta_origem, numero_conta_destino, valor: Number(valor) }

    transferencias.push(transferencia);

    return res.status(204).send();
}

module.exports = {
    depositar,
    sacar,
    transferir
}