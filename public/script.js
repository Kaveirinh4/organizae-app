import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, addDoc, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- Configuração do Firebase ---
// ATENÇÃO: Suas chaves de API estão expostas aqui. Em um projeto real, é crucial proteger essas chaves
// usando variáveis de ambiente (por exemplo, com .env) para evitar que sejam usadas indevidamente.
const firebaseConfig = {
    apiKey: "AIzaSyC9x9uQSkv76at3xamHVimjJkHfHVYTTx0",
    authDomain: "organizaecompartilha.firebaseapp.com",
    projectId: "organizaecompartilha",
    storageBucket: "organizaecompartilha.appspot.com",
    messagingSenderId: "415844063684",
    appId: "1:415844063684:web:88e216151eee1c298d2c91"
};

// --- Inicialização dos Serviços do Firebase ---
// Aqui, conectamos nosso app aos serviços do Firebase que vamos usar.
const app = initializeApp(firebaseConfig); // O app principal do Firebase
const db = getFirestore(app); // O banco de dados Firestore
const auth = getAuth(app); // O serviço de autenticação

// --- Evento Principal ---
// Este evento espera todo o conteúdo HTML da página ser carregado antes de executar nosso código.
// É uma boa prática para garantir que todos os elementos que o script vai manipular já existam.
document.addEventListener('DOMContentLoaded', () => {

    // --- Seleção de Elementos DOM ---
    // Para evitar repetir `document.getElementById` toda hora, criamos uma função auxiliar `getEl`
    // e um grande objeto `elements` para guardar todas as referências aos elementos HTML que usaremos.
    const getEl = (id) => document.getElementById(id);
    const elements = {
        loaderOverlay: getEl('loader-overlay'),
        authContainer: getEl('auth-container'),
        loginView: getEl('login-view'),
        registerView: getEl('register-view'),
        appView: getEl('app-view'),
        loginForm: getEl('login-form'),
        registerForm: getEl('register-form'),
        loginError: getEl('login-error'),
        registerError: getEl('register-error'),
        goToRegisterBtn: getEl('go-to-register'),
        goToLoginBtn: getEl('go-to-login'),
        logoutBtn: getEl('logout-btn'),
        currentUserName: getEl('current-user-name'),
        userAvatarInitials: getEl('user-avatar-initials'),
        forgotPasswordModal: getEl('forgot-password-modal'),
        forgotPasswordLink: getEl('forgot-password-link'),
        closeForgotModalBtn: getEl('close-forgot-modal'),
        forgotPasswordForm: getEl('forgot-password-form'),
        forgotFeedback: getEl('forgot-feedback'),
        loginPasswordInput: getEl('login-password'),
        loginPasswordToggle: getEl('login-password-toggle'),
        registerPasswordToggle: getEl('register-password-toggle'),
        // Elementos do App
        mainTitle: getEl('main-title'),
        contentViews: document.querySelectorAll('.content-view'),
        navButtons: document.querySelectorAll('.sidebar-item, .new-transaction-btn'),
        expenseForm: getEl('expense-form'),
        transactionsList: getEl('transactions-list'),
        noTransactionsMessage: getEl('no-transactions'),
        totalBalance: getEl('total-balance'),
        totalIncome: getEl('total-income'),
        totalExpense: getEl('total-expense'),
        cancelAddBtn: getEl('cancel-add-btn'),
        sidebar: getEl('sidebar'),
        toggleSidebarDesktop: getEl('toggle-sidebar-desktop'),
        toggleSidebarMobile: getEl('toggle-sidebar-mobile'),
        overlay: getEl('overlay'),
        itemTexts: document.querySelectorAll('.item-text, .logo-placeholder'),
        installmentsSection: getEl('installments-section'),
        categorySelect: getEl('category'),
        newCategoryInput: getEl('new-category-input'),
        addCategoryBtn: getEl('add-category-btn'),
        categoryList: getEl('category-list'),
        paymentMethodSelect: getEl('payment-method'),
        newPaymentMethodInput: getEl('new-payment-method-name'),
        addPaymentMethodBtn: getEl('add-payment-method-btn'),
        paymentMethodList: getEl('payment-method-list'),
        settingsCards: document.querySelectorAll('.settings-card-header'),
        openCalendarBtn: getEl('open-calendar-btn'),
        calendarModal: getEl('calendar-modal'),
        closeCalendarModalBtn: getEl('close-calendar-modal'),
        calendarPrevMonthBtn: getEl('calendar-prev-month-btn'),
        calendarNextMonthBtn: getEl('calendar-next-month-btn'),
        calendarMonthDisplay: getEl('calendar-month-display'),
        calendarDaysGrid: getEl('calendar-days-grid'),
        historyTitle: getEl('history-title'),
        installmentsList: getEl('installments-list'),
        paymentMethodType: getEl('payment-method-type'),
        creditCardFields: getEl('credit-card-fields'),
        dayPickerModal: getEl('day-picker-modal'),
        dayPickerGrid: getEl('day-picker-grid'),
        dayPickerTitle: getEl('day-picker-title'),
        closeDayPickerModalBtn: getEl('close-day-picker-modal'),
        notification: getEl('notification'),
        expenseFieldset: getEl('expense-fieldset'),
        noCardWarning: getEl('no-card-warning'),
        userAvatarButton: getEl('user-avatar-button'),
        userMenu: getEl('user-menu'),
        userMenuEmail: getEl('user-menu-email'),
        editProfileBtn: getEl('edit-profile-btn'),
        profileModal: getEl('profile-modal'),
        profileNameInput: getEl('profile-name'),
        emojiGrid: getEl('emoji-grid'),
        cancelProfileBtn: getEl('cancel-profile-btn'),
        saveProfileBtn: getEl('save-profile-btn'),
        financialMonthStartDaySelect: getEl('financial-month-start-day'),
        // Elementos do Seletor de Ícones
        iconPickerModal: getEl('icon-picker-modal'),
        iconPickerGrid: getEl('icon-picker-grid'),
        closeIconPickerModalBtn: getEl('close-icon-picker-modal'),
    };

    // --- Estado da Aplicação ---
    // Estas são as variáveis que guardam os dados enquanto o usuário está com o app aberto.
    // O grande objetivo será fazer com que esses dados venham do Firestore e sejam salvos lá.
    let transactions = [];
    let categories = []; // Será carregado do Firestore.
    let paymentMethods = [
        { name: 'Débito', type: 'other' },
        { name: 'Dinheiro', type: 'other' },
        { name: 'Pix', type: 'other' }
    ];
    let displayedDate = new Date();
    let calendarDate = new Date();
    let currentDayPickerTarget = null;
    let userProfile = { name: '', avatar: '👤', financialMonthStartDay: 1 };

    // --- Funções Auxiliares ---
    const showLoader = (show) => { elements.loaderOverlay.style.display = show ? 'flex' : 'none'; };

    const showNotification = (message, isError = true) => {
        elements.notification.textContent = message;
        elements.notification.className = `fixed top-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg transition-opacity duration-300 ${isError ? 'bg-red-500' : 'bg-green-500'}`;

        elements.notification.classList.remove('hidden');
        setTimeout(() => {
            elements.notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            elements.notification.classList.remove('show');
            setTimeout(() => {
                elements.notification.classList.add('hidden');
            }, 500);
        }, 3000);
    };

    const switchScreen = (screen) => {
        showLoader(true);
        if (screen === 'auth') {
            elements.authContainer.classList.remove('hidden');
            elements.appView.classList.add('hidden');
            elements.loginView.classList.remove('hidden');
            elements.registerView.classList.add('hidden');
        } else if (screen === 'app') {
            elements.authContainer.classList.add('hidden');
            elements.appView.classList.remove('hidden');
        }
        showLoader(false);
    };

    const switchAppView = (viewId) => {
        elements.contentViews.forEach(view => view.classList.add('hidden'));
        const activeView = getEl(viewId);
        if (activeView) {
            activeView.classList.remove('hidden');
            const newTitle = document.querySelector(`[data-view="${viewId}"] .item-text`)?.textContent || 'Adicionar Lançamento';
            elements.mainTitle.textContent = newTitle;
        }
        elements.navButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.view === viewId);
        });
    };

    const formatCurrency = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // --- Funções de Renderização (UI) ---
    // Estas funções são responsáveis por desenhar e atualizar as informações na tela.

    const renderCategories = () => {
        // Popula o <select> no formulário de adicionar despesa.
        elements.categorySelect.innerHTML = '';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.name; // O valor continua sendo o nome para simplicidade
            option.textContent = `${cat.icon} ${cat.name}`;
            elements.categorySelect.appendChild(option);
        });

        // Renderiza a lista gerenciável nas Configurações.
        elements.categoryList.innerHTML = '';
        categories.forEach((cat, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'settings-list-item';
            itemEl.setAttribute('draggable', 'true'); // Habilita o arrastar
            itemEl.dataset.id = cat.id; // Adiciona o ID para referência
            itemEl.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="material-symbols-rounded category-item-icon">${cat.icon}</span>
                    <span>${cat.name}</span>
                </div>
                <div class="flex items-center">
                    <button data-action="move-up" data-index="${index}" ${index === 0 ? 'disabled' : ''} class="px-2 hover:text-accent-color disabled:opacity-25"><span class="material-symbols-rounded">arrow_upward</span></button>
                    <button data-action="move-down" data-index="${index}" ${index === categories.length - 1 ? 'disabled' : ''} class="px-2 hover:text-accent-color disabled:opacity-25"><span class="material-symbols-rounded">arrow_downward</span></button>
                    <button data-action="delete" data-id="${cat.id}" class="px-2 text-red-500 hover:text-red-700"><span class="material-symbols-rounded">delete</span></button>
                </div>
            `;
            elements.categoryList.appendChild(itemEl);
        });
    };

    const renderPaymentMethods = (filter) => {
        const selectElement = elements.paymentMethodSelect;
        selectElement.innerHTML = '';
        let methodsToRender = paymentMethods;

        if (filter === 'credit-card') {
            methodsToRender = paymentMethods.filter(pm => pm.type === 'credit-card');
        }

        methodsToRender.forEach(pm => {
            const option = document.createElement('option');
            option.value = pm.name;
            option.textContent = pm.name;
            selectElement.appendChild(option);
        });

        elements.paymentMethodList.innerHTML = '';
        paymentMethods.forEach((pm, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'settings-list-item';
            itemEl.setAttribute('draggable', 'true');
            itemEl.dataset.id = pm.id;

            let details = '';
            if(pm.type === 'credit-card') {
                details = `<span class="text-xs text-muted-text-color ml-2">(Fecha dia ${pm.closingDay}, Vence dia ${pm.dueDate})</span>`;
            }

            const icon = pm.type === 'credit-card' ? 'credit_card' : 'payments';

            itemEl.innerHTML = `
                <div class="flex items-center gap-2 flex-grow">
                    <span class="material-symbols-rounded category-item-icon" style="background-color: #e5e7eb;">${icon}</span>
                    <div>
                        <span>${pm.name}</span>
                        ${details}
                    </div>
                </div>
                <div class="flex items-center">
                    <button data-action="delete" data-id="${pm.id}" class="px-2 text-red-500 hover:text-red-700"><span class="material-symbols-rounded">delete</span></button>
                </div>
            `;
            elements.paymentMethodList.appendChild(itemEl);
        });
    };

    const renderHistory = () => {
        elements.transactionsList.innerHTML = '';
        const filteredTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.date); // As datas do Firestore podem precisar ser convertidas
            return txDate.getFullYear() === displayedDate.getFullYear() &&
                   txDate.getMonth() === displayedDate.getMonth() &&
                   txDate.getDate() === displayedDate.getDate() &&
                   !tx.groupId; // Exclui parcelas
        });

        if (filteredTransactions.length === 0) {
            elements.transactionsList.innerHTML = '<p id="no-transactions" class="text-center text-gray-500">Nenhum lançamento para este dia.</p>';
            return;
        }

        filteredTransactions.forEach(tx => {
            const itemEl = document.createElement('div');
            itemEl.className = 'transaction-item';
            const amountClass = tx.type === 'income' ? 'income' : 'expense';
            const icon = tx.type === 'income' ? 'add_card' : 'shopping_cart';
            const sign = tx.type === 'income' ? '+' : '-';

            itemEl.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-icon"><span class="material-symbols-rounded">${icon}</span></div>
                    <div>
                        <strong>${tx.description}</strong>
                        <div class="text-sm text-gray-500">${tx.category} | ${tx.paymentMethod}</div>
                    </div>
                </div>
                <div class="flex items-center transaction-actions">
                    <div class="transaction-amount ${amountClass}">${sign} ${formatCurrency(tx.amount)}</div>
                    <button data-action="edit" data-id="${tx.id}" class="action-btn ml-4"><span class="material-symbols-rounded">edit</span></button>
                    <button data-action="delete" data-id="${tx.id}" class="action-btn"><span class="material-symbols-rounded">delete</span></button>
                </div>
            `;
            elements.transactionsList.appendChild(itemEl);
        });
    };

    const renderDashboardSummary = () => {
        const now = new Date();
        const startDay = userProfile.financialMonthStartDay;

        let startDate = new Date(now.getFullYear(), now.getMonth(), startDay);
        if (now.getDate() < startDay) {
            startDate.setMonth(startDate.getMonth() - 1);
        }

        let endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1);

        const currentMonthTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.date); // Garante que a string ISO da data seja convertida para um objeto Date
            return txDate >= startDate && txDate <= endDate;
        });

        let income = 0;
        let expense = 0;

        currentMonthTransactions.forEach(tx => {
            if (tx.type === 'income') {
                income += tx.amount;
            } else {
                expense += tx.amount;
            }
        });

        elements.totalIncome.textContent = `+ ${formatCurrency(income)}`;
        elements.totalExpense.textContent = `- ${formatCurrency(expense)}`;
        elements.totalBalance.textContent = formatCurrency(income - expense);
    };

    const renderCalendar = () => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        elements.calendarMonthDisplay.textContent = new Date(year, month).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        elements.calendarDaysGrid.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            elements.calendarDaysGrid.innerHTML += `<div class="calendar-day empty"></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;
            dayEl.dataset.day = day;
            if (day === displayedDate.getDate() && month === displayedDate.getMonth() && year === displayedDate.getFullYear()) {
                dayEl.classList.add('selected');
            }
            elements.calendarDaysGrid.appendChild(dayEl);
        }
    };

    const renderInstallments = () => {
        const container = elements.installmentsList;
        container.innerHTML = '';
        const grouped = transactions
            .filter(tx => tx.groupId)
            .reduce((acc, tx) => {
                if (!acc[tx.groupId]) {
                    acc[tx.groupId] = [];
                }
                acc[tx.groupId].push(tx);
                return acc;
            }, {});

        if (Object.keys(grouped).length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">Nenhum parcelamento ativo.</p>';
            return;
        }

        for (const groupId in grouped) {
            const installments = grouped[groupId];
            const first = installments[0];
            const totalAmount = first.amount * first.totalInstallments;
            const paidCount = installments.filter(p => p.isPaid).length;
            const paidAmount = paidCount * first.amount;
            const remainingAmount = totalAmount - paidAmount;

            const cardEl = document.createElement('div');
            cardEl.className = 'settings-card';
            cardEl.innerHTML = `
                <div class="settings-card-header">
                     <div class="flex items-center gap-4">
                        <span class="material-symbols-rounded text-accent-color">credit_card</span>
                        <div>
                            <h3 class="font-bold text-lg">${first.description.replace(/ \(\d+\/\d+\)$/, '')}</h3>
                            <p class="text-sm text-muted-text-color">${paidCount} de ${first.totalInstallments} pagas - Total: ${formatCurrency(totalAmount)} | Restante: ${formatCurrency(remainingAmount)}</p>
                        </div>
                    </div>
                    <span class="material-symbols-rounded">expand_more</span>
                </div>
                <div class="settings-card-body">
                    <div>
                    ${installments.map(inst => {
                        const dueDate = new Date(inst.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
                        const description = inst.description || '';
                        return `
                        <div class="flex justify-between items-center py-2 border-b border-gray-200">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" data-id="${inst.id}" class="installment-checkbox" ${inst.isPaid ? 'checked' : ''}>
                                <span>${description} - Venc: ${dueDate}</span>
                            </label>
                            <span>${formatCurrency(inst.amount)}</span>
                        </div>
                    `}).join('')}
                    </div>
                </div>
            `;
            container.appendChild(cardEl);
        }
    };


    // --- Lógica de Autenticação e Dados em Tempo Real ---

    let unsubscribeListeners = []; // Array para guardar as funções de unsubscribe

    // Função para encerrar todos os listeners ativos.
    function cleanupListeners() {
        unsubscribeListeners.forEach(unsubscribe => unsubscribe());
        unsubscribeListeners = [];
    }

    // Configura os listeners em tempo real para os dados do usuário.
    function setupRealtimeListeners(uid) {
        showLoader(true);
        cleanupListeners(); // Garante que listeners antigos sejam removidos antes de criar novos.

        const userDocRef = getUserDocRef(uid);

        // Listener para o documento principal do usuário (perfil, categorias, etc.)
        const unsubscribeUserDoc = onSnapshot(userDocRef, async (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                userProfile = data.profile || { name: auth.currentUser.email.split('@')[0], avatar: '👤', financialMonthStartDay: 1 };

                // Lógica de migração para categorias
                if (data.categories && data.categories.length > 0 && typeof data.categories[0] === 'string') {
                    const migratedCategories = data.categories.map((cat, index) => ({ id: `cat-${index}`, name: cat, icon: 'label' }));
                    await updateUserDoc({ categories: migratedCategories });
                    // O próprio listener vai pegar a atualização, então não precisamos setar localmente.
                } else {
                    categories = data.categories || [];
                }

                // Lógica de migração para meios de pagamento
                if (data.paymentMethods && data.paymentMethods.length > 0 && !data.paymentMethods[0].id) {
                    const migratedMethods = data.paymentMethods.map((pm, index) => ({ id: `pm-${index}`, ...pm }));
                    await updateUserDoc({ paymentMethods: migratedMethods });
                } else {
                    paymentMethods = data.paymentMethods || [];
                }

                updateUI();
            } else {
                // Se o documento do usuário não existe, cria com dados iniciais.
                console.log("Criando dados iniciais para novo usuário.");
                await createInitialUserData(uid, auth.currentUser.email);
                // O onSnapshot será acionado novamente após a criação do documento.
            }
        });

        // Listener para a subcoleção de transações
        const transactionsRef = getUserSubcollectionRef(uid, "transactions");
        const unsubscribeTransactions = onSnapshot(transactionsRef, (querySnapshot) => {
            transactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Apenas atualiza as partes da UI que dependem das transações.
            renderDashboardSummary();
            renderHistory();
            renderInstallments();
            showLoader(false); // Esconde o loader após o carregamento inicial das transações.
        });

        unsubscribeListeners.push(unsubscribeUserDoc, unsubscribeTransactions);
    }

    // Função para criar os dados iniciais de um novo usuário no Firestore.
    async function createInitialUserData(uid, email) {
        const initialProfile = { name: email.split('@')[0], avatar: '👤', financialMonthStartDay: 1 };
        // Nova estrutura de categorias com ícones do Material Symbols.
        const initialCategories = [
            { id: 'cat-1', name: 'Alimentação', icon: 'restaurant' },
            { id: 'cat-2', name: 'Transporte', icon: 'commute' },
            { id: 'cat-3', name: 'Moradia', icon: 'home' },
            { id: 'cat-4', name: 'Lazer', icon: 'sports_esports' },
            { id: 'cat-5', name: 'Saúde', icon: 'health_and_safety' },
            { id: 'cat-6', name: 'Educação', icon: 'school' },
            { id: 'cat-7', name: 'Compras', icon: 'shopping_bag' },
            { id: 'cat-8', name: 'Outros', icon: 'receipt_long' }
        ];
        const initialPaymentMethods = [
            { id: 'pm-1', name: 'Débito', type: 'other' },
            { id: 'pm-2', name: 'Dinheiro', type: 'other' },
            { id: 'pm-3', name: 'Pix', type: 'other' }
        ];

        const userRef = getUserDocRef(uid);
        await setDoc(userRef, {
            email: email,
            createdAt: new Date(),
            profile: initialProfile,
            categories: initialCategories,
            paymentMethods: initialPaymentMethods
        });

        // Atribuímos os dados iniciais às nossas variáveis locais.
        userProfile = initialProfile;
        categories = initialCategories;
        paymentMethods = initialPaymentMethods;
        transactions = [];
    }

    // --- Funções de Serviço de Dados (Interação com o Firestore) ---

    // Funções auxiliares para garantir que todos os acessos ao DB usem o caminho correto
    // conforme definido nas regras de segurança do Firestore: /artifacts/{appId}/users/{userId}
    function getUserDocRef(uid) {
        if (!uid) return null;
        return doc(db, "artifacts", firebaseConfig.appId, "users", uid);
    }

    function getUserSubcollectionRef(uid, subcollectionName) {
        const userDocRef = getUserDocRef(uid);
        if (!userDocRef) return null;
        return collection(userDocRef, subcollectionName);
    }


    // Uma função genérica para atualizar os campos de nível superior no documento do usuário.
    // Isso nos ajuda a não repetir o mesmo código para salvar o perfil, categorias, etc.
    async function updateUserDoc(data) {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        try {
            const userRef = getUserDocRef(uid);
            await updateDoc(userRef, data);
            showNotification("Alterações salvas com sucesso!", false);
        } catch (error) {
            console.error("Erro ao atualizar dados do usuário:", error);
            showNotification("Não foi possível salvar suas alterações.", true);
        }
    }

    // Funções específicas para transações, que vivem numa subcoleção.
    async function addTransaction(transactionData) {
        const uid = auth.currentUser?.uid;
        if (!uid) return null;

        try {
            const transactionsRef = getUserSubcollectionRef(uid, "transactions");
            const docRef = await addDoc(transactionsRef, transactionData);
            showNotification("Lançamento adicionado!", false);
            return docRef.id; // Retorna o ID do novo documento.
        } catch (error) {
            console.error("Erro ao adicionar transação:", error);
            showNotification("Não foi possível adicionar o lançamento.", true);
            return null;
        }
    }

    async function updateTransaction(txId, data) {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        try {
            const userDocRef = getUserDocRef(uid);
            const transactionRef = doc(userDocRef, "transactions", txId);
            await updateDoc(transactionRef, data);
        } catch (error) {
            console.error("Erro ao atualizar transação:", error);
            showNotification("Não foi possível atualizar o lançamento.", true);
        }
    }

    async function deleteTransaction(txId) {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        try {
            const userDocRef = getUserDocRef(uid);
            const transactionRef = doc(userDocRef, "transactions", txId);
            await deleteDoc(transactionRef);
            showNotification("Lançamento apagado.", false);
        } catch (error) {
            console.error("Erro ao apagar transação:", error);
            showNotification("Não foi possível apagar o lançamento.", true);
        }
    }


    // Função para atualizar toda a interface do usuário com os dados mais recentes.
    function updateUI() {
        if (!auth.currentUser) return; // Garante que não tentaremos atualizar a UI sem um usuário.
        elements.currentUserName.textContent = userProfile.name;
        elements.userAvatarInitials.textContent = userProfile.avatar;
        elements.userMenuEmail.textContent = auth.currentUser.email;
        elements.financialMonthStartDaySelect.value = userProfile.financialMonthStartDay;

        renderCategories();
        renderPaymentMethods();
        renderDashboardSummary();
        renderHistory();
        renderInstallments();
    }


    // onAuthStateChanged é o "porteiro" do nosso app. Ele nos diz se o usuário está logado ou não.
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Se existe um usuário, configuramos os listeners em tempo real e mudamos para a tela do app.
            setupRealtimeListeners(user.uid);
            switchScreen('app');
        } else {
            // Se não há usuário, limpamos os listeners, redefinimos o estado e mostramos a tela de login.
            cleanupListeners();
            transactions = [];
            categories = [];
            paymentMethods = [];
            userProfile = { name: '', avatar: '👤', financialMonthStartDay: 1 };
            switchScreen('auth');
        }
    });

    // --- Event Listeners (Ouvintes de Eventos) ---
    // Aqui, dizemos ao código o que fazer quando o usuário interage com a página (clica, envia formulário, etc.).

    elements.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede que a página recarregue ao enviar o formulário.
        showLoader(true);
        elements.loginError.textContent = '';
        const email = elements.loginForm['login-email'].value;
        const password = elements.loginForm['login-password'].value;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // O onAuthStateChanged vai cuidar de mudar a tela.
        } catch (error) {
            console.error("[ERRO NO LOGIN]", error.code);
            elements.loginError.textContent = "E-mail ou senha inválidos.";
            showLoader(false);
        }
    });

    elements.registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoader(true);
        elements.registerError.textContent = '';
        const email = getEl('register-email').value.trim();
        const password = getEl('register-password').value.trim();

        if (password.length < 6) {
            elements.registerError.textContent = 'A senha deve ter no mínimo 6 caracteres.';
            showLoader(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            // Ao criar um usuário, também criamos um "documento" para ele no Firestore para guardar seus dados futuros.
            await createInitialUserData(user.uid, user.email);

            // Embora o onAuthStateChanged vá disparar, chamar a atualização da UI aqui torna a transição mais rápida.
            updateUI();
            switchScreen('app');

        } catch (error) {
            console.error("Erro no Cadastro:", error.code);
            if (error.code === 'auth/email-already-in-use') {
                elements.registerError.textContent = 'Este e-mail já está em uso.';
            } else {
                elements.registerError.textContent = 'Ocorreu um erro ao registrar.';
            }
            showLoader(false);
        }
    });

    elements.logoutBtn.addEventListener('click', () => {
        signOut(auth);
    });

    elements.goToRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        elements.loginView.classList.add('hidden');
        elements.registerView.classList.remove('hidden');
    });
    elements.goToLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        elements.registerView.classList.add('hidden');
        elements.loginView.classList.remove('hidden');
    });

    elements.forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); elements.forgotPasswordModal.classList.remove('hidden'); });
    elements.closeForgotModalBtn.addEventListener('click', () => { elements.forgotPasswordModal.classList.add('hidden'); elements.forgotFeedback.textContent = ''; });
    elements.forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = getEl('forgot-email').value;
        sendPasswordResetEmail(auth, email)
            .then(() => {
                elements.forgotFeedback.textContent = 'Link de recuperação enviado!';
                elements.forgotFeedback.className = "text-sm text-center text-green-600";
            })
            .catch((error) => {
                console.error("Erro ao enviar email:", error.code);
                elements.forgotFeedback.textContent = 'Email não encontrado ou inválido.';
                elements.forgotFeedback.className = "text-sm text-center text-red-500";
            });
    });

    // Função para alternar a visibilidade da senha
    const setupPasswordToggle = (toggleEl, inputEl) => {
        if (toggleEl) {
            toggleEl.addEventListener('click', () => {
                const icon = toggleEl.querySelector('span');
                if (inputEl.type === 'password') {
                    inputEl.type = 'text';
                    icon.textContent = 'visibility_off';
                } else {
                    inputEl.type = 'password';
                    icon.textContent = 'visibility';
                }
            });
        }
    };
    setupPasswordToggle(elements.loginPasswordToggle, elements.loginPasswordInput);
    setupPasswordToggle(elements.registerPasswordToggle, getEl('register-password'));

    // --- Event Listeners do App ---
    elements.navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const view = button.dataset.view;
            if(view) {
               switchAppView(view);
               // Se estiver no celular, fecha o menu ao clicar num item.
               if (window.innerWidth < 768 && elements.sidebar.classList.contains('open')) {
                    toggleSidebarMobile();
               }
            }
        });
    });

    elements.expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoader(true);

        const description = getEl('description').value;
        const amount = parseFloat(getEl('amount').value);
        const category = elements.categorySelect.value;
        const paymentMethodName = elements.paymentMethodSelect.value;

        if (!description || !(amount > 0)) {
            showNotification("Descrição e valor são obrigatórios.", true);
            showLoader(false);
            return;
        }

        if (editingTxId) {
            // --- MODO DE EDIÇÃO ---
            const updatedData = {
                description,
                amount,
                category,
                paymentMethod: paymentMethodName,
            };
            await updateTransaction(editingTxId, updatedData);
            showNotification("Lançamento atualizado!", false);
        } else {
            // --- MODO DE ADIÇÃO ---
            const purchaseMethod = document.querySelector('input[name="purchase-method"]:checked').value;
            const type = 'expense';

            if (purchaseMethod === 'installment') {
                const count = parseInt(getEl('installments-count').value);
                const groupId = `group-${Date.now()}`;
                const paymentMethod = paymentMethods.find(pm => pm.name === paymentMethodName);

                let firstInstallmentDate = new Date();
                if (paymentMethod && paymentMethod.type === 'credit-card') {
                    const purchaseDate = new Date();
                    if (purchaseDate.getDate() > paymentMethod.closingDay) {
                        firstInstallmentDate.setMonth(firstInstallmentDate.getMonth() + 1);
                    }
                    firstInstallmentDate.setDate(paymentMethod.dueDate);
                }

                for (let i = 0; i < count; i++) {
                    const installmentDate = new Date(firstInstallmentDate);
                    installmentDate.setMonth(installmentDate.getMonth() + i);
                    const transactionData = {
                        description: `${description} (${i + 1}/${count})`,
                        amount: amount / count,
                        type, category, paymentMethod: paymentMethodName,
                        date: installmentDate.toISOString(),
                        isPaid: false,
                        groupId,
                        totalInstallments: count,
                    };
                    await addTransaction(transactionData);
                }
            } else {
                const transactionData = {
                    description, amount, type, category, paymentMethod: paymentMethodName,
                    date: new Date().toISOString(),
                };
                await addTransaction(transactionData);
            }
        }

        // Limpa e volta para a tela inicial
        elements.expenseForm.reset();
        elements.installmentsSection.classList.add('hidden');
        document.querySelector('input[name="purchase-method"][value="single"]').checked = true;
        editingTxId = null;
        elements.expenseForm.querySelector('button[type="submit"]').textContent = 'Adicionar';
        switchAppView('dashboard-view');
        showLoader(false);
    });

    elements.cancelAddBtn.addEventListener('click', () => {
        switchAppView('dashboard-view');
    });

    // --- Lógica do Seletor de Ícones ---
    const availableIcons = [
        'restaurant', 'shopping_cart', 'commute', 'home', 'sports_esports', 'health_and_safety',
        'school', 'shopping_bag', 'receipt_long', 'flight', 'local_gas_station', 'local_pharmacy',
        'pets', 'movie', 'fitness_center', 'family_restroom', 'checkroom', 'savings', 'credit_card',
        'phone_iphone', 'devices', 'music_note', 'brush', 'build'
    ];
    let newCategoryName = '';

    function renderIconPicker() {
        elements.iconPickerGrid.innerHTML = '';
        availableIcons.forEach(icon => {
            const iconEl = document.createElement('button');
            iconEl.className = 'p-2 rounded-lg hover:bg-gray-200 flex items-center justify-center';
            iconEl.dataset.icon = icon;
            iconEl.innerHTML = `<span class="material-symbols-rounded text-3xl">${icon}</span>`;
            elements.iconPickerGrid.appendChild(iconEl);
        });
    }

    elements.addCategoryBtn.addEventListener('click', () => {
        newCategoryName = elements.newCategoryInput.value.trim();
        if (newCategoryName && !categories.some(c => c.name === newCategoryName)) {
            renderIconPicker();
            elements.iconPickerModal.classList.remove('hidden');
        } else if (newCategoryName) {
            showNotification('Essa categoria já existe.', true);
        }
    });

    elements.iconPickerGrid.addEventListener('click', (e) => {
        const iconButton = e.target.closest('button');
        if (iconButton && iconButton.dataset.icon) {
            const newCat = {
                id: `cat-${Date.now()}`,
                name: newCategoryName,
                icon: iconButton.dataset.icon
            };
            categories.push(newCat);
            updateUserDoc({ categories: categories });
            renderCategories();
            elements.newCategoryInput.value = '';
            elements.iconPickerModal.classList.add('hidden');
        }
    });

    elements.closeIconPickerModalBtn.addEventListener('click', () => {
        elements.iconPickerModal.classList.add('hidden');
    });

    // --- Lógica de Drag and Drop para Categorias ---
    let draggedItemId = null;

    elements.categoryList.addEventListener('dragstart', (e) => {
        const item = e.target.closest('.settings-list-item');
        if (item) {
            draggedItemId = item.dataset.id;
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => {
                item.classList.add('dragging');
            }, 0);
        }
    });

    elements.categoryList.addEventListener('dragend', (e) => {
        const item = e.target.closest('.settings-list-item');
        if (item) {
            item.classList.remove('dragging');
            draggedItemId = null;
        }
    });

    elements.categoryList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const list = elements.categoryList;
        const draggingItem = list.querySelector('.dragging');
        if (!draggingItem) return;

        list.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));

        const targetItem = e.target.closest('.settings-list-item');
        if (targetItem && targetItem !== draggingItem) {
            targetItem.classList.add('drag-over');
        }
    });

    elements.categoryList.addEventListener('drop', async (e) => {
        e.preventDefault();
        const list = elements.categoryList;
        list.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));

        const dropTargetId = e.target.closest('.settings-list-item')?.dataset.id;
        if (!dropTargetId || dropTargetId === draggedItemId) {
            return;
        }

        const draggedIndex = categories.findIndex(cat => cat.id === draggedItemId);
        const dropIndex = categories.findIndex(cat => cat.id === dropTargetId);

        if (draggedIndex === -1 || dropIndex === -1) return;

        const [draggedItem] = categories.splice(draggedIndex, 1);
        categories.splice(dropIndex, 0, draggedItem);

        await updateUserDoc({ categories: categories });
        renderCategories();
    });

    elements.categoryList.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const action = button.dataset.action;

        if (action === 'delete') {
            const categoryIdToDelete = button.dataset.id;
            categories = categories.filter(cat => cat.id !== categoryIdToDelete);
            updateUserDoc({ categories: categories });
            renderCategories();
            return;
        }

        const itemElement = button.closest('.settings-list-item');
        const itemId = itemElement?.dataset.id;
        const index = categories.findIndex(cat => cat.id === itemId);
        let changed = false;

        if (action === 'move-up' && index > 0) {
            [categories[index], categories[index - 1]] = [categories[index - 1], categories[index]];
            changed = true;
        }

        if (action === 'move-down' && index < categories.length - 1) {
            [categories[index], categories[index + 1]] = [categories[index + 1], categories[index]];
            changed = true;
        }

        if(changed) {
            updateUserDoc({ categories: categories });
            renderCategories();
        }
    });

    elements.addPaymentMethodBtn.addEventListener('click', () => {
        const name = elements.newPaymentMethodInput.value.trim();
        const type = elements.paymentMethodType.value;
        if (!name || paymentMethods.some(pm => pm.name === name)) {
            showNotification('Meio de pagamento já existe ou nome é inválido.', true);
            return;
        }

        const newPaymentMethod = {
            id: `pm-${Date.now()}`,
            name,
            type
        };

        if (type === 'credit-card') {
            const closingDay = parseInt(getEl('closing-day').value);
            const dueDate = parseInt(getEl('due-day').value);
            if (!closingDay || !dueDate) {
                showNotification('Para cartão de crédito, preencha os dias de fechamento e vencimento.', true);
                return;
            }
            newPaymentMethod.closingDay = closingDay;
            newPaymentMethod.dueDate = dueDate;
        }

        paymentMethods.push(newPaymentMethod);
        updateUserDoc({ paymentMethods: paymentMethods });
        renderPaymentMethods();
        elements.newPaymentMethodInput.value = '';
        getEl('closing-day').value = '';
        getEl('due-day').value = '';
    });

    elements.paymentMethodList.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action="delete"]');
        if (!button) return;

        const idToDelete = button.dataset.id;
        paymentMethods = paymentMethods.filter(pm => pm.id !== idToDelete);
        updateUserDoc({ paymentMethods: paymentMethods });
        renderPaymentMethods();
    });

    // --- Lógica de Drag and Drop para Meios de Pagamento ---
    let draggedPaymentMethodId = null;

    elements.paymentMethodList.addEventListener('dragstart', (e) => {
        const item = e.target.closest('.settings-list-item');
        if (item) {
            draggedPaymentMethodId = item.dataset.id;
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => item.classList.add('dragging'), 0);
        }
    });

    elements.paymentMethodList.addEventListener('dragend', (e) => {
        const item = e.target.closest('.settings-list-item');
        if (item) {
            item.classList.remove('dragging');
            draggedPaymentMethodId = null;
        }
    });

    elements.paymentMethodList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const list = elements.paymentMethodList;
        const draggingItem = list.querySelector('.dragging');
        if (!draggingItem) return;
        list.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        const targetItem = e.target.closest('.settings-list-item');
        if (targetItem && targetItem !== draggingItem) {
            targetItem.classList.add('drag-over');
        }
    });

    elements.paymentMethodList.addEventListener('drop', async (e) => {
        e.preventDefault();
        elements.paymentMethodList.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        const dropTargetId = e.target.closest('.settings-list-item')?.dataset.id;
        if (!dropTargetId || dropTargetId === draggedPaymentMethodId) return;

        const draggedIndex = paymentMethods.findIndex(pm => pm.id === draggedPaymentMethodId);
        const dropIndex = paymentMethods.findIndex(pm => pm.id === dropTargetId);
        if (draggedIndex === -1 || dropIndex === -1) return;

        const [draggedItem] = paymentMethods.splice(draggedIndex, 1);
        paymentMethods.splice(dropIndex, 0, draggedItem);

        await updateUserDoc({ paymentMethods: paymentMethods });
        renderPaymentMethods();
    });


    // Lógica da Sidebar
    function toggleSidebarDesktop() {
        elements.sidebar.classList.toggle('collapsed');
        const isCollapsed = elements.sidebar.classList.contains('collapsed');

        elements.itemTexts.forEach(item => {
            item.style.display = isCollapsed ? 'none' : 'inline';
        });
        document.querySelector('.new-transaction-btn').style.justifyContent = isCollapsed ? 'center' : 'flex-start';
    }

    function toggleSidebarMobile() {
        elements.sidebar.classList.toggle('open');
        elements.overlay.classList.toggle('active');
    }

    elements.toggleSidebarDesktop.addEventListener('click', toggleSidebarDesktop);
    if (elements.toggleSidebarMobile) {
        elements.toggleSidebarMobile.addEventListener('click', toggleSidebarMobile);
    }
    if (elements.overlay) {
        elements.overlay.addEventListener('click', toggleSidebarMobile);
    }

    // Lógica para mostrar/esconder seção de parcelas
    const purchaseMethodRadios = document.querySelectorAll('input[name="purchase-method"]');
    purchaseMethodRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const isInstallment = e.target.value === 'installment';
            elements.installmentsSection.classList.toggle('hidden', !isInstallment);

            const creditCards = paymentMethods.filter(pm => pm.type === 'credit-card');
            if (isInstallment) {
                if (creditCards.length === 0) {
                    elements.noCardWarning.classList.remove('hidden');
                    elements.expenseFieldset.disabled = true;
                } else {
                    renderPaymentMethods('credit-card');
                    elements.noCardWarning.classList.add('hidden');
                    elements.expenseFieldset.disabled = false;
                }
            } else {
                renderPaymentMethods();
                elements.noCardWarning.classList.add('hidden');
                elements.expenseFieldset.disabled = false;
            }
        });
    });

    // Lógica de Acordeão Controlada por JavaScript
    elements.settingsCards.forEach(header => {
        header.addEventListener('click', () => {
            const card = header.parentElement;
            const body = card.querySelector('.settings-card-body');
            const isOpening = !card.classList.contains('open');

            // Fecha todos os cards abertos
            document.querySelectorAll('.settings-card.open').forEach(openCard => {
                if (openCard !== card) {
                    const openBody = openCard.querySelector('.settings-card-body');
                    openBody.style.maxHeight = '0px';
                    openCard.classList.remove('open');
                }
            });

            // Abre ou fecha o card clicado
            if (isOpening) {
                card.classList.add('open');
                // Define max-height com base na altura real do conteúdo
                body.style.maxHeight = body.scrollHeight + 'px';
            } else {
                card.classList.remove('open');
                body.style.maxHeight = '0px';
            }
        });
    });


    // Listener separado para os checkboxes de parcelamento para não misturar lógicas
    elements.installmentsList.addEventListener('click', (e) => {
        const checkbox = e.target.closest('.installment-checkbox');
        if (checkbox) {
            const txId = checkbox.dataset.id;
            const tx = transactions.find(t => t.id === txId);
            if (tx) {
                tx.isPaid = checkbox.checked;
                updateTransaction(txId, { isPaid: tx.isPaid });
                // A UI se atualizará em tempo real pelo onSnapshot, mas uma re-renderização local pode ser mais rápida.
                renderInstallments();
            }
        }
    });

    let editingTxId = null; // Variável para rastrear se estamos editando ou adicionando

    // Listener para ações na lista de histórico (Editar/Apagar)
    elements.transactionsList.addEventListener('click', (e) => {
        const button = e.target.closest('.action-btn');
        if (!button) return;

        const action = button.dataset.action;
        const txId = button.dataset.id;

        if (action === 'delete') {
            if (confirm('Tem certeza que deseja apagar este lançamento?')) {
                deleteTransaction(txId);
            }
        }

        if (action === 'edit') {
            const txToEdit = transactions.find(tx => tx.id === txId);
            if (txToEdit) {
                // Preenche o formulário com os dados existentes
                getEl('description').value = txToEdit.description;
                getEl('amount').value = txToEdit.amount;
                elements.categorySelect.value = txToEdit.category;
                elements.paymentMethodSelect.value = txToEdit.paymentMethod;

                // Entra no modo de edição
                editingTxId = txId;
                elements.expenseForm.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';
                switchAppView('add-expense-view');
            }
        }
    });

    // Lógica do Calendário
    elements.openCalendarBtn.addEventListener('click', () => {
        calendarDate = new Date(displayedDate);
        renderCalendar();
        elements.calendarModal.classList.remove('hidden');
    });

    elements.closeCalendarModalBtn.addEventListener('click', () => {
        elements.calendarModal.classList.add('hidden');
    });

    elements.calendarPrevMonthBtn.addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() - 1);
        renderCalendar();
    });

    elements.calendarNextMonthBtn.addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() + 1);
        renderCalendar();
    });

    elements.calendarDaysGrid.addEventListener('click', (e) => {
        const dayEl = e.target.closest('.calendar-day');
        if (dayEl && !dayEl.classList.contains('empty')) {
            const day = parseInt(dayEl.dataset.day);
            displayedDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
            elements.historyTitle.textContent = `Lançamentos de ${displayedDate.toLocaleDateString('pt-BR')}`;
            renderHistory();
            elements.calendarModal.classList.add('hidden');
        }
    });

    elements.paymentMethodType.addEventListener('change', (e) => {
        elements.creditCardFields.classList.toggle('hidden', e.target.value !== 'credit-card');
    });

    // Lógica do Seletor de Dia
    const renderDayPicker = () => {
        elements.dayPickerGrid.innerHTML = '';
        for (let i = 1; i <= 31; i++) {
            const dayEl = document.createElement('button');
            dayEl.className = 'p-2 rounded-full hover:bg-accent-color hover:text-white transition-colors';
            dayEl.textContent = i;
            dayEl.dataset.day = i;
            elements.dayPickerGrid.appendChild(dayEl);
        }
    };

    document.body.addEventListener('click', (e) => {
        const trigger = e.target.closest('.day-picker-trigger');
        if (trigger) {
            currentDayPickerTarget = trigger.dataset.target; // 'closing-day' or 'due-day'
            elements.dayPickerTitle.textContent = currentDayPickerTarget === 'closing-day' ? 'Selecione o Dia de Fechamento' : 'Selecione o Dia de Vencimento';
            renderDayPicker();
            elements.dayPickerModal.classList.remove('hidden');
        }
    });

    elements.dayPickerGrid.addEventListener('click', (e) => {
        const dayButton = e.target.closest('button');
        if (dayButton && dayButton.dataset.day) {
            const day = dayButton.dataset.day;
            if (currentDayPickerTarget) {
                getEl(currentDayPickerTarget).value = day;
            }
            elements.dayPickerModal.classList.add('hidden');
        }
    });

    elements.closeDayPickerModalBtn.addEventListener('click', () => {
        elements.dayPickerModal.classList.add('hidden');
    });

    // Lógica do menu do usuário
    elements.userAvatarButton.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.userMenu.classList.toggle('hidden');
    });

    window.addEventListener('click', (e) => {
        if (!elements.userMenu.classList.contains('hidden')) {
            if (!elements.userMenu.contains(e.target) && !elements.userAvatarButton.contains(e.target)) {
                elements.userMenu.classList.add('hidden');
            }
        }
    });

    // Lógica do Modal de Perfil
    const emojis = ['😀', '😎', '🚀', '💰', '🏠', '🚗', '💡', '🎉', '💼', '📈', '🎯', '✅'];
    elements.emojiGrid.innerHTML = emojis.map(emoji => `<button class="emoji-btn">${emoji}</button>`).join('');

    elements.editProfileBtn.addEventListener('click', () => {
        elements.profileNameInput.value = userProfile.name;
        elements.profileModal.classList.remove('hidden');
        elements.userMenu.classList.add('hidden');
    });

    elements.cancelProfileBtn.addEventListener('click', () => {
        elements.profileModal.classList.add('hidden');
    });

    elements.emojiGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.emoji-btn');
        if (btn) {
            userProfile.avatar = btn.textContent;
            updateUserDoc({ profile: userProfile }); // Salva no Firestore
            elements.userAvatarInitials.textContent = userProfile.avatar;
            elements.profileModal.classList.add('hidden');
        }
    });

    elements.saveProfileBtn.addEventListener('click', () => {
        const newName = elements.profileNameInput.value.trim();
        if (newName) {
            userProfile.name = newName;
            updateUserDoc({ profile: userProfile }); // Salva no Firestore
            elements.currentUserName.textContent = userProfile.name;
            elements.profileModal.classList.add('hidden');
        }
    });

    // Lógica de Preferências
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Dia ${i}`;
        elements.financialMonthStartDaySelect.appendChild(option);
    }
    elements.financialMonthStartDaySelect.value = userProfile.financialMonthStartDay;

    elements.financialMonthStartDaySelect.addEventListener('change', (e) => {
        userProfile.financialMonthStartDay = parseInt(e.target.value);
        updateUserDoc({ profile: userProfile }); // Salva no Firestore
        renderDashboardSummary();
    });

});
