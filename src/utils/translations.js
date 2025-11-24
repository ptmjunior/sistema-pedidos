// Traduções pt-BR para o sistema
export const translations = {
    // Navigation
    nav: {
        dashboard: 'Painel',
        requests: 'Pedidos',
        approvals: 'Aprovações',
        vendors: 'Fornecedores',
        notifications: 'Notificações',
        users: 'Usuários',
        users: 'Usuários',
        logout: 'Sair',
        appName: 'Pedido de Compra'
    },

    // Dashboard
    dashboard: {
        title: 'Painel',
        welcomeBack: 'Bem-vindo de volta',
        newRequest: '+ Novo Pedido',
        pendingApproval: 'Aguardando Aprovação',
        approved: 'Aprovados (Total)',
        totalSpend: 'Gasto Total',
        activeRequests: 'Pedidos ativos',
        allTime: 'Desde o início',
        approvedAmount: 'Valor aprovado',
        recentRequests: 'Pedidos Recentes',
        description: 'Descrição',
        amount: 'Valor',
        status: 'Status',
        date: 'Data',
        items: 'itens'
    },

    // Requests
    requests: {
        title: 'Pedidos',
        myRequests: 'Meus Pedidos',
        allRequests: 'Todos os Pedidos',
        allStatus: 'Todos os Status',
        pending: 'Pendente',
        approved: 'Aprovado',
        rejected: 'Rejeitado',
        noRequests: 'Nenhum pedido encontrado.',
        requester: 'Solicitante',
        priority: 'Prioridade',
        delivery: 'Entrega',
        actions: 'Ações',
        edit: 'Editar',
        viewOnly: 'Apenas Visualizar',
        low: 'baixa',
        medium: 'média',
        high: 'alta'
    },

    // Approvals
    approvals: {
        title: 'Aprovações Pendentes',
        subtitle: 'Revise e aprove pedidos de compra.',
        noPending: 'Nenhuma aprovação pendente.',
        analyze: 'Analisar',
        backToList: '← Voltar para Lista',
        analyzeRequest: 'Analisar Pedido',
        rejectRequest: 'Rejeitar Pedido',
        approveRequest: 'Aprovar Pedido',
        requestDetails: 'Detalhes do Pedido',
        requestId: 'ID do Pedido',
        requester: 'Solicitante',
        department: 'Departamento',
        priority: 'Prioridade',
        deliveryDate: 'Data de Entrega',
        notes: 'Observações',
        financialSummary: 'Resumo Financeiro',
        totalItems: 'Total de Itens',
        totalAmount: 'Valor Total',
        items: 'Itens',
        category: 'Categoria',
        vendor: 'Fornecedor',
        link: 'Link',
        qty: 'Qtd',
        price: 'Preço',
        total: 'Total',
        view: 'Ver'
    },

    // Create Order
    createOrder: {
        title: 'Novo Pedido de Compra',
        editTitle: 'Editar Pedido',
        basicInfo: 'Informações Básicas',
        description: 'Descrição',
        descriptionPlaceholder: 'Descreva o que você precisa...',
        priority: 'Prioridade',
        low: 'Baixa',
        medium: 'Média',
        high: 'Alta',
        deliveryDate: 'Data de Entrega',
        notes: 'Observações',
        notesPlaceholder: 'Informações adicionais...',
        items: 'Itens do Pedido',
        addItem: '+ Adicionar Item',
        itemDescription: 'Descrição do Item',
        quantity: 'Quantidade',
        unitPrice: 'Preço Unitário',
        vendor: 'Fornecedor',
        selectVendor: 'Selecionar fornecedor',
        productLink: 'Link do Produto',
        productLinkPlaceholder: 'https://...',
        remove: 'Remover',
        summary: 'Resumo',
        totalItems: 'Total de Itens',
        totalAmount: 'Valor Total',
        cancel: 'Cancelar',
        submitRequest: 'Enviar Pedido',
        updateRequest: 'Atualizar Pedido'
    },

    // Vendors
    vendors: {
        title: 'Fornecedores',
        addVendor: '+ Adicionar Fornecedor',
        noVendors: 'Nenhum fornecedor cadastrado.',
        name: 'Nome',
        contact: 'Contato',
        email: 'Email',
        phone: 'Telefone',
        category: 'Categoria',
        actions: 'Ações',
        edit: 'Editar',
        delete: 'Excluir',
        addNew: 'Adicionar Novo Fornecedor',
        vendorName: 'Nome do Fornecedor',
        contactName: 'Nome do Contato',
        cancel: 'Cancelar',
        add: 'Adicionar'
    },

    // Notifications
    notifications: {
        title: 'Notificações',
        noNotifications: 'Nenhuma notificação.',
        markAsRead: 'Marcar como lida',
        viewRequest: 'Ver Pedido',
        new: 'Nova',
        submission: 'Submissão',
        approval: 'Aprovação',
        rejection: 'Rejeição'
    },

    // Users
    users: {
        title: 'Gerenciar Usuários',
        addUser: '+ Adicionar Usuário',
        noUsers: 'Nenhum usuário cadastrado.',
        name: 'Nome',
        email: 'Email',
        role: 'Função',
        department: 'Departamento',
        actions: 'Ações',
        edit: 'Editar',
        delete: 'Excluir',
        addNew: 'Adicionar Novo Usuário',
        userName: 'Nome do Usuário',
        selectRole: 'Selecionar função',
        requester: 'Solicitante',
        approver: 'Aprovador',
        buyer: 'Comprador',
        cancel: 'Cancelar',
        add: 'Adicionar',
        save: 'Salvar'
    },

    // Login
    login: {
        title: 'Casa das Tintas',
        subtitle: 'Sistema de Pedidos de Compra',
        email: 'Email',
        emailPlaceholder: 'seu.email@casadastintas-al.com',
        password: 'Senha',
        passwordPlaceholder: 'Digite sua senha',
        loginButton: 'Entrar',
        loggingIn: 'Entrando...',
        error: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
        demoCredentials: 'Credenciais de teste:',
        requester: 'Requisitante',
        approver: 'Aprovador',
        buyer: 'Comprador',
        passwordLabel: 'Senha para todos:'
    },

    // Status
    status: {
        pending: 'Pendente',
        approved: 'Aprovado',
        rejected: 'Rejeitado'
    },

    // Common
    common: {
        loading: 'Carregando...',
        save: 'Salvar',
        cancel: 'Cancelar',
        delete: 'Excluir',
        edit: 'Editar',
        add: 'Adicionar',
        close: 'Fechar',
        confirm: 'Confirmar',
        yes: 'Sim',
        no: 'Não',
        search: 'Buscar',
        filter: 'Filtrar',
        export: 'Exportar',
        import: 'Importar'
    },

    // Forgot Password
    forgotPassword: {
        title: 'Esqueci Minha Senha',
        subtitle: 'Digite seu email para receber o link de recuperação',
        email: 'Email',
        emailPlaceholder: 'seu@email.com',
        sendButton: 'Enviar Link de Recuperação',
        sending: 'Enviando...',
        successMessage: 'Email enviado! Verifique sua caixa de entrada.',
        errorMessage: 'Erro ao enviar email. Tente novamente.',
        backToLogin: '← Voltar para Login'
    },

    // Reset Password
    resetPassword: {
        title: 'Redefinir Senha',
        subtitle: 'Digite sua nova senha',
        newPassword: 'Nova Senha',
        confirmPassword: 'Confirmar Senha',
        passwordPlaceholder: 'Mínimo 6 caracteres',
        updateButton: 'Atualizar Senha',
        updating: 'Atualizando...',
        successMessage: 'Senha atualizada com sucesso!',
        errorMessage: 'Erro ao atualizar senha. Tente novamente.',
        passwordMismatch: 'As senhas não coincidem',
        redirecting: 'Redirecionando para login...'
    }
};

export default translations;
