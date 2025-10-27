// ===============================
// SISTEMA PIZZARIA - JAVASCRIPT
// Complete web application for pizza shop management
// Includes: Clients, Products, Orders, Reports, Promotions
// Data persistence with localStorage
// SECURITY ENHANCED VERSION
// ===============================

// Immediate security check - must be first thing executed
(function() {
    // Check if user is authenticated before anything else
    const userData = localStorage.getItem('loggedUser');
    if (!userData) {
        alert('Acesso negado. Redirecionando para a página de login...');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const user = JSON.parse(userData);
        if (!user.username || !user.role || !user.loginTime || !user.sessionToken) {
            throw new Error('Dados de sessão inválidos');
        }
        
        // Check if session is expired
        const loginTime = new Date(user.loginTime).getTime();
        const currentTime = new Date().getTime();
        const sessionTimeout = 8 * 60 * 60 * 1000; // 8 hours
        
        if (currentTime - loginTime > sessionTimeout) {
            throw new Error('Sessão expirada');
        }
        
    } catch (error) {
        localStorage.removeItem('loggedUser');
        localStorage.removeItem('rememberLogin');
        alert(`Erro de autenticação: ${error.message}. Redirecionando para login...`);
        window.location.href = 'index.html';
        return;
    }
})();

// Security Configuration
const SECURITY_CONFIG = {
    SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours
    ACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutes of inactivity
    CSRF_TOKEN_LENGTH: 32,
    REQUIRED_PERMISSIONS: {
        'admin': ['read', 'write', 'delete', 'export', 'settings'],
        'manager': ['read', 'write', 'delete', 'export'],
        'staff': ['read', 'write']
    }
};

// Global Data Storage
let clients = [];
let products = [];
let orders = [];
let promotions = [];
let orderItems = [];
let editingClient = null;
let editingProduct = null;
let editingPromotion = null;

// Security Variables
let currentUser = null;
let sessionToken = null;
let lastActivity = null;

// Client Modal Variables
let currentStep = 1;
const totalSteps = 3;

// Security Functions
function initializeSecurity() {
    // Check if user is authenticated
    const userData = localStorage.getItem('loggedUser');
    if (!userData) {
        redirectToLogin('Acesso negado. Faça login primeiro.');
        return false;
    }
    
    try {
        currentUser = JSON.parse(userData);
        
        // Validate session data
        if (!currentUser.username || !currentUser.role || !currentUser.loginTime) {
            throw new Error('Dados de sessão inválidos');
        }
        
        // Check session timeout
        const loginTime = new Date(currentUser.loginTime).getTime();
        const currentTime = new Date().getTime();
        
        if (currentTime - loginTime > SECURITY_CONFIG.SESSION_TIMEOUT) {
            throw new Error('Sessão expirada');
        }
        
        // Check activity timeout
        if (currentUser.lastActivity) {
            const lastActivityTime = new Date(currentUser.lastActivity).getTime();
            if (currentTime - lastActivityTime > SECURITY_CONFIG.ACTIVITY_TIMEOUT) {
                throw new Error('Sessão expirou por inatividade');
            }
        }
        
        sessionToken = currentUser.sessionToken;
        lastActivity = new Date().toISOString();
        
        // Update last activity
        updateLastActivity();
        
        // Setup activity monitoring
        setupActivityMonitoring();
        
        // Setup session management
        setupSessionManagement();
        
        logSecurityEvent('admin_access_granted', {
            username: currentUser.username,
            role: currentUser.role
        });
        
        return true;
        
    } catch (error) {
        redirectToLogin(`Erro de autenticação: ${error.message}`);
        return false;
    }
}

function redirectToLogin(message = '') {
    logSecurityEvent('admin_access_denied', { reason: message });
    
    // Clear invalid session
    localStorage.removeItem('loggedUser');
    localStorage.removeItem('rememberLogin');
    
    // Show alert if message provided
    if (message) {
        alert(message);
    }
    
    // Redirect to login page
    const currentPath = window.location.href;
    const loginPath = currentPath.replace('admin.html', 'index.html');
    window.location.href = loginPath;
}

function checkPermission(action) {
    if (!currentUser || !currentUser.role) {
        return false;
    }
    
    const userPermissions = SECURITY_CONFIG.REQUIRED_PERMISSIONS[currentUser.role] || [];
    return userPermissions.includes(action);
}

function updateLastActivity() {
    if (currentUser) {
        currentUser.lastActivity = new Date().toISOString();
        localStorage.setItem('loggedUser', JSON.stringify(currentUser));
        lastActivity = currentUser.lastActivity;
    }
}

function setupActivityMonitoring() {
    // Track user activity
    const activityEvents = ['click', 'keypress', 'mousemove', 'scroll'];
    
    activityEvents.forEach(event => {
        document.addEventListener(event, function() {
            updateLastActivity();
        }, { passive: true });
    });
}

function setupSessionManagement() {
    // Check session validity every minute
    setInterval(function() {
        const userData = localStorage.getItem('loggedUser');
        if (!userData) {
            redirectToLogin('Sessão perdida. Faça login novamente.');
            return;
        }
        
        try {
            const user = JSON.parse(userData);
            const currentTime = new Date().getTime();
            
            // Check session timeout
            const loginTime = new Date(user.loginTime).getTime();
            if (currentTime - loginTime > SECURITY_CONFIG.SESSION_TIMEOUT) {
                redirectToLogin('Sessão expirou. Faça login novamente.');
                return;
            }
            
            // Check activity timeout
            if (user.lastActivity) {
                const lastActivityTime = new Date(user.lastActivity).getTime();
                if (currentTime - lastActivityTime > SECURITY_CONFIG.ACTIVITY_TIMEOUT) {
                    redirectToLogin('Sessão expirou por inatividade. Faça login novamente.');
                    return;
                }
            }
            
        } catch (error) {
            redirectToLogin('Erro na validação da sessão.');
        }
    }, 60000); // Check every minute
}

function logSecurityEvent(event, details = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        event,
        details,
        user: currentUser ? currentUser.username : 'anonymous',
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(logEntry);
    
    // Keep only last 200 entries
    if (logs.length > 200) {
        logs.splice(0, logs.length - 200);
    }
    
    localStorage.setItem('security_logs', JSON.stringify(logs));
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Remove script tags and potentially dangerous content
    return input
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
}

function validateCSRF() {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken && storedToken.length === SECURITY_CONFIG.CSRF_TOKEN_LENGTH;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('Initializing Pizzaria System...');
        
        // Initialize security first
        if (!initializeSecurity()) {
            return; // Exit if security check fails
        }
        
        console.log(`Welcome ${currentUser.name} (${currentUser.role})`);
        
        loadData();
        updateDashboard();
        loadClientsTable();
        loadProductsTable();
        loadOrdersTable();
        loadPromotions();
        setupFormHandlers();
        
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        const reportDate = document.getElementById('report-date');
        if (reportDate) reportDate.value = today;
        
        const currentMonth = new Date().toISOString().slice(0, 7);
        const reportMonth = document.getElementById('report-month');
        if (reportMonth) reportMonth.value = currentMonth;
        
        // Setup enhanced dashboard
        setupDashboard();
        
        // Apply role-based UI restrictions
        applyRoleBasedRestrictions();
        
        // Update user display in header
        updateUserDisplay();
        
        console.log('System initialized successfully!');
        
        // Test client modal functionality
        window.testClientModal = function() {
            console.log('Testing client modal...');
            openModal('client-modal');
        };
        
        console.log('You can test the client modal by running: testClientModal() in the console');
        
        // Add sample data if no data exists (for testing)
        setTimeout(() => {
            if (clients.length === 0 && products.length === 0) {
                if (confirm('Deseja carregar dados de exemplo para testar o sistema?')) {
                    loadSampleData();
                }
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error initializing system:', error);
        logSecurityEvent('system_initialization_error', { error: error.message });
        showToast('Erro ao inicializar sistema', 'error');
    }
});

// ===============================
// ROLE-BASED SECURITY FUNCTIONS
// ===============================

function applyRoleBasedRestrictions() {
    if (!currentUser) return;
    
    const userRole = currentUser.role;
    
    // Admin has full access - no restrictions
    if (userRole === 'admin') {
        return;
    }
    
    // Manager restrictions - disable some settings
    if (userRole === 'manager') {
        // Hide or disable advanced settings
        const advancedElements = document.querySelectorAll('[data-role="admin-only"]');
        advancedElements.forEach(element => {
            element.style.display = 'none';
        });
        return;
    }
    
    // Staff restrictions - read-only on many features
    if (userRole === 'staff') {
        // Disable delete operations
        const deleteButtons = document.querySelectorAll('.delete-btn, .btn-danger, [data-action="delete"]');
        deleteButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.title = 'Acesso restrito para seu perfil';
        });
        
        // Disable edit operations for critical data
        const criticalEditButtons = document.querySelectorAll('[data-critical="true"] .edit-btn');
        criticalEditButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.title = 'Acesso restrito para seu perfil';
        });
        
        // Hide admin-only and manager-only elements
        const restrictedElements = document.querySelectorAll('[data-role="admin-only"], [data-role="manager-only"]');
        restrictedElements.forEach(element => {
            element.style.display = 'none';
        });
        
        // Show restricted access notice
        showToast(`Acesso limitado para perfil: ${userRole}`, 'warning');
    }
}

function validateAction(action) {
    if (!checkPermission(action)) {
        logSecurityEvent('unauthorized_action_attempt', {
            action: action,
            userRole: currentUser.role
        });
        showToast('Ação não permitida para seu perfil', 'error');
        return false;
    }
    return true;
}

// Enhanced action wrapper for security
function secureAction(action, callback, requiredPermission = 'write') {
    return function(...args) {
        if (!validateAction(requiredPermission)) {
            return false;
        }
        
        logSecurityEvent('action_executed', {
            action: action,
            requiredPermission: requiredPermission
        });
        
        return callback.apply(this, args);
    };
}

// ===============================
// DATA PERSISTENCE (localStorage)
// ===============================

function loadData() {
    clients = JSON.parse(localStorage.getItem('pizzaria_clients') || '[]');
    products = JSON.parse(localStorage.getItem('pizzaria_products') || '[]');
    orders = JSON.parse(localStorage.getItem('pizzaria_orders') || '[]');
    promotions = JSON.parse(localStorage.getItem('pizzaria_promotions') || '[]');
}

function saveData() {
    localStorage.setItem('pizzaria_clients', JSON.stringify(clients));
    localStorage.setItem('pizzaria_products', JSON.stringify(products));
    localStorage.setItem('pizzaria_orders', JSON.stringify(orders));
    localStorage.setItem('pizzaria_promotions', JSON.stringify(promotions));
}

// ===============================
// NAVIGATION & UI HELPERS
// ===============================

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show target section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to nav button based on section
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        if (btn.onclick && btn.onclick.toString().includes(`'${sectionId}'`)) {
            btn.classList.add('active');
        }
    });
    
    // Update data when switching sections
    if (sectionId === 'dashboard') {
        updateDashboard();
    } else if (sectionId === 'orders') {
        updateOrderSelects();
    } else if (sectionId === 'clients') {
        loadClientsTable();
    } else if (sectionId === 'products') {
        loadProductsTable();
    } else if (sectionId === 'promotions') {
        loadPromotions();
    }
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    
    // Load clients and products for order modal
    if (modalId === 'order-modal') {
        updateOrderSelects();
        clearOrderForm();
    }
    
    // Setup enhanced client modal
    if (modalId === 'client-modal') {
        setupClientModal();
    }
    
    // Setup enhanced product modal
    if (modalId === 'product-modal') {
        setupProductModal();
    }
}

function setupClientModal() {
    try {
        // Reset form to step 1
        currentStep = 1;
        updateFormStep();
        
        // Setup input formatting
        setupInputFormatting();
        
        // Setup real-time validation
        setupRealTimeValidation();
        
        // Generate next available ID
        generateNextClientId();
        
        // Clear all fields
        clearClientForm();
        
        console.log('Client modal setup completed successfully');
    } catch (error) {
        console.error('Error setting up client modal:', error);
        showToast('Erro ao configurar formulário', 'error');
    }
}

function generateNextClientId() {
    const idInput = document.getElementById('client-id');
    if (!editingClient) {
        let nextId = 1;
        while (clients.some(client => client.id === nextId.toString().padStart(3, '0'))) {
            nextId++;
        }
        idInput.value = nextId.toString().padStart(3, '0');
        validateField(idInput);
    }
}

function clearClientForm() {
    const form = document.getElementById('client-form');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.id !== 'client-id' || editingClient) {
            input.value = '';
        }
        input.classList.remove('valid', 'invalid');
        
        const fieldStatus = input.parentNode.querySelector('.field-status');
        if (fieldStatus) {
            fieldStatus.classList.remove('show', 'valid', 'invalid');
        }
    });
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    clearForm(modalId);
}

function clearForm(modalId) {
    const form = document.querySelector(`#${modalId} form`);
    if (form) {
        form.reset();
    }
    
    // Reset editing states
    editingClient = null;
    editingProduct = null;
    editingPromotion = null;
    
    // Special handling for client modal
    if (modalId === 'client-modal') {
        document.getElementById('client-modal-title').textContent = 'Novo Cliente';
        document.getElementById('client-id').disabled = false;
        clearClientForm();
    }
    
    // Special handling for product modal
    if (modalId === 'product-modal') {
        document.getElementById('product-modal-title').textContent = 'Novo Produto';
        document.getElementById('product-id').disabled = false;
        setupProductModal();
    }
    
    // Clear order items
    if (modalId === 'order-modal') {
        orderItems = [];
        updateOrderDisplay();
    }
}

function showToast(message, type = 'success') {
    try {
        let container = document.getElementById('toast-container');
        
        // Create container if it doesn't exist
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; pointer-events: none;';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'error' ? 'fa-exclamation-circle' : 
                     type === 'warning' ? 'fa-exclamation-triangle' : 'fa-check-circle';
        
        toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
        container.appendChild(toast);
        
        // Remove toast after animation
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 3500);
        
        console.log('Toast shown:', message, type);
    } catch (error) {
        console.error('Error showing toast:', error);
        // Fallback to alert
        alert(message);
    }
}

// ===============================
// MODAL FUNCTIONS
// ===============================

function openClientModal() {
    openModal('client-modal');
}

function openProductModal() {
    openModal('product-modal');
}

// ===============================
// DASHBOARD FUNCTIONS
// ===============================

function updateDashboard() {
    // Update counters
    document.getElementById('total-clients').textContent = clients.length;
    document.getElementById('total-products').textContent = products.length;
    
    // Calculate today's orders and sales
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(order => order.date.startsWith(today));
    const todaySales = todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    
    document.getElementById('orders-today').textContent = todayOrders.length;
    document.getElementById('sales-today').textContent = `R$ ${todaySales.toFixed(2).replace('.', ',')}`;
    
    // Update recent orders table
    loadRecentOrders();
}

function loadRecentOrders() {
    const tbody = document.querySelector('#recent-orders-table tbody');
    tbody.innerHTML = '';
    
    // Get last 5 orders
    const recentOrders = orders.slice(-5).reverse();
    
    recentOrders.forEach(order => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${order.client}</td>
            <td>${order.product}</td>
            <td>R$ ${parseFloat(order.total).toFixed(2).replace('.', ',')}</td>
            <td>${formatDateTime(order.date)}</td>
        `;
    });
}

// ===============================
// CLIENT MANAGEMENT
// ===============================

function setupFormHandlers() {
    console.log('Setting up form handlers...');
    
    // Client form
    document.getElementById('client-form').addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Client form submitted');
        saveClient();
    });
    
    // Product form
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Product form submitted');
            saveProduct();
        });
        console.log('Product form handler set up successfully');
    } else {
        console.error('Product form not found!');
    }
    
    // Order form
    document.getElementById('order-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveOrder();
    });
    
    // Promotion form
    document.getElementById('promotion-form').addEventListener('submit', function(e) {
        e.preventDefault();
        savePromotion();
    });
    
    // Enhanced Order Form Event Listeners
    setupOrderFormListeners();
}

// Modal management functions
function openOrderModal() {
    updateOrderSelects();
    clearOrderForm();
    openModal('order-modal');
}

function setupOrderFormListeners() {
    // Client selection change
    const clientSelect = document.getElementById('client-select');
    if (clientSelect) {
        clientSelect.addEventListener('change', updateClientInfo);
    }
    
    // Product selection change
    const productSelect = document.getElementById('product-select');
    if (productSelect) {
        productSelect.addEventListener('change', updateProductInfo);
    }
    
    // Product size change
    const productSize = document.getElementById('product-size');
    if (productSize) {
        productSize.addEventListener('change', updateProductPrice);
    }
    
    // Product quantity change
    const productQuantity = document.getElementById('product-quantity');
    if (productQuantity) {
        productQuantity.addEventListener('input', updateProductTotal);
    }
    
    // Add product button
    const btnAddProduct = document.getElementById('btn-add-product');
    if (btnAddProduct) {
        btnAddProduct.addEventListener('click', addProductToOrderEnhanced);
    }
    
    // Delivery type change
    const deliveryOptions = document.querySelectorAll('input[name="delivery-type"]');
    deliveryOptions.forEach(option => {
        option.addEventListener('change', updateDeliveryOptions);
    });
    
    // Discount change
    const orderDiscount = document.getElementById('order-discount');
    if (orderDiscount) {
        orderDiscount.addEventListener('input', updateOrderTotals);
    }
    
    // Paid value change
    const paidValue = document.getElementById('paid-value');
    if (paidValue) {
        paidValue.addEventListener('input', calculateChange);
    }
    
    // Clear order form button
    const btnClearOrder = document.getElementById('btn-clear-order');
    if (btnClearOrder) {
        btnClearOrder.addEventListener('click', clearOrderForm);
    }
}

function saveClient() {
    // Security check for write permission
    if (!validateAction('write')) {
        return;
    }
    
    // Validate all steps first
    let allValid = true;
    for (let step = 1; step <= totalSteps; step++) {
        const stepElement = document.getElementById(`step-${step}`);
        const requiredFields = stepElement.querySelectorAll('input[required], select[required]');
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                allValid = false;
            }
        });
    }
    
    if (!allValid) {
        showToast('Por favor, corrija os campos inválidos', 'error');
        // Go to first step with errors
        for (let step = 1; step <= totalSteps; step++) {
            const stepElement = document.getElementById(`step-${step}`);
            const invalidFields = stepElement.querySelectorAll('.invalid');
            if (invalidFields.length > 0) {
                currentStep = step;
                updateFormStep();
                break;
            }
        }
        return;
    }
    
    // Collect all form data and sanitize inputs
    const clientData = {
        id: sanitizeInput(document.getElementById('client-id').value.trim()),
        name: sanitizeInput(document.getElementById('client-name').value.trim()),
        cpf: document.getElementById('client-cpf').value.replace(/\D/g, ''),
        birth: document.getElementById('client-birth').value,
        email: sanitizeInput(document.getElementById('client-email').value.trim()),
        phone: sanitizeInput(document.getElementById('client-phone').value.trim()),
        whatsapp: sanitizeInput(document.getElementById('client-whatsapp').value.trim()),
        notes: sanitizeInput(document.getElementById('client-notes').value.trim()),
        cep: sanitizeInput(document.getElementById('client-cep').value.trim()),
        address: sanitizeInput(document.getElementById('client-address').value.trim()),
        neighborhood: sanitizeInput(document.getElementById('client-neighborhood').value.trim()),
        complement: sanitizeInput(document.getElementById('client-complement').value.trim()),
        reference: sanitizeInput(document.getElementById('client-reference').value.trim()),
        createdAt: editingClient ? editingClient.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Format birth date
    if (clientData.birth) {
        clientData.birthFormatted = formatDateToBR(clientData.birth);
    }
    
    // Check for duplicate ID (only if not editing)
    if (!editingClient && clients.some(client => client.id === clientData.id)) {
        showToast('ID já existe! Escolha outro ID.', 'error');
        currentStep = 1;
        updateFormStep();
        document.getElementById('client-id').focus();
        return;
    }
    
    if (editingClient) {
        // Update existing client
        const index = clients.findIndex(c => c.id === editingClient.id);
        clients[index] = { ...editingClient, ...clientData };
        
        logSecurityEvent('client_updated', {
            clientId: clientData.id,
            clientName: clientData.name
        });
        
        showToast('Cliente atualizado com sucesso!');
    } else {
        // Add new client
        clients.push(clientData);
        
        logSecurityEvent('client_created', {
            clientId: clientData.id,
            clientName: clientData.name
        });
        
        showToast('Cliente cadastrado com sucesso!');
    }
    
    // Reset form
    editingClient = null;
    
    saveData();
    loadClientsTable();
    updateDashboard();
    closeModal('client-modal');
    updateDashboard();
    closeModal('client-modal');
}

function loadClientsTable() {
    const tbody = document.querySelector('#clients-table tbody');
    tbody.innerHTML = '';
    
    clients.forEach(client => {
        const row = tbody.insertRow();
        
        // Format CPF for display
        const cpfFormatted = client.cpf ? 
            client.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : 
            'Não informado';
        
        row.innerHTML = `
            <td>${client.id}</td>
            <td>${client.name}</td>
            <td>${cpfFormatted}</td>
            <td>${client.email}</td>
            <td>${client.phone}</td>
            <td>${client.neighborhood || 'Não informado'}</td>
            <td>
                <button class="btn-view" onclick="viewClient('${client.id}')" title="Ver detalhes">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-edit" onclick="editClient('${client.id}')" title="Editar cliente">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteClient('${client.id}')" title="Excluir cliente">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    });
}

function viewClient(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    
    // Populate client details modal
    document.getElementById('view-client-id').textContent = client.id;
    document.getElementById('view-client-name').textContent = client.name || 'Não informado';
    document.getElementById('view-client-cpf').textContent = client.cpf ? 
        client.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : 'Não informado';
    document.getElementById('view-client-birth').textContent = client.birthFormatted || client.birth || 'Não informado';
    document.getElementById('view-client-email').textContent = client.email || 'Não informado';
    document.getElementById('view-client-phone').textContent = client.phone || 'Não informado';
    document.getElementById('view-client-whatsapp').textContent = client.whatsapp || 'Não informado';
    document.getElementById('view-client-notes').textContent = client.notes || 'Nenhuma observação';
    document.getElementById('view-client-cep').textContent = client.cep || 'Não informado';
    document.getElementById('view-client-address').textContent = client.address || 'Não informado';
    document.getElementById('view-client-neighborhood').textContent = client.neighborhood || 'Não informado';
    document.getElementById('view-client-complement').textContent = client.complement || 'Não informado';
    document.getElementById('view-client-reference').textContent = client.reference || 'Não informado';
    
    // Format and show creation/update dates
    if (client.createdAt) {
        const createdDate = new Date(client.createdAt).toLocaleString('pt-BR');
        document.getElementById('view-client-created').textContent = createdDate;
    } else {
        document.getElementById('view-client-created').textContent = 'Não informado';
    }
    
    if (client.updatedAt) {
        const updatedDate = new Date(client.updatedAt).toLocaleString('pt-BR');
        document.getElementById('view-client-updated').textContent = updatedDate;
    } else {
        document.getElementById('view-client-updated').textContent = 'Não informado';
    }
    
    openModal('view-client-modal');
}

function editClient(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    
    editingClient = client;
    
    // Reset form to step 1
    currentStep = 1;
    updateFormStep();
    
    // Populate Step 1 - Personal Data
    document.getElementById('client-id').value = client.id;
    document.getElementById('client-name').value = client.name || '';
    document.getElementById('client-cpf').value = client.cpf ? 
        client.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '';
    document.getElementById('client-birth').value = client.birth ? 
        formatDateFromBR(client.birthFormatted || client.birth) : '';
    
    // Populate Step 2 - Contact
    document.getElementById('client-email').value = client.email || '';
    document.getElementById('client-phone').value = client.phone || '';
    document.getElementById('client-whatsapp').value = client.whatsapp || '';
    document.getElementById('client-notes').value = client.notes || '';
    
    // Populate Step 3 - Address
    document.getElementById('client-cep').value = client.cep || '';
    document.getElementById('client-address').value = client.address || '';
    document.getElementById('client-neighborhood').value = client.neighborhood || '';
    document.getElementById('client-complement').value = client.complement || '';
    document.getElementById('client-reference').value = client.reference || '';
    
    document.getElementById('client-modal-title').textContent = 'Editar Cliente';
    document.getElementById('client-id').disabled = true;
    
    openModal('client-modal');
}

function deleteClient(id) {
    // Security check for delete permission
    if (!validateAction('delete')) {
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        const clientToDelete = clients.find(c => c.id === id);
        
        logSecurityEvent('client_deleted', {
            clientId: id,
            clientName: clientToDelete ? clientToDelete.name : 'unknown'
        });
        
        clients = clients.filter(c => c.id !== id);
        saveData();
        loadClientsTable();
        updateDashboard();
        showToast('Cliente excluído com sucesso!');
    }
}

function searchClients() {
    const search = document.getElementById('client-search').value.toLowerCase();
    const rows = document.querySelectorAll('#clients-table tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
}

// ===============================
// PRODUCT MANAGEMENT
// ===============================

function saveProduct() {
    // Security check for write permission
    if (!validateAction('write')) {
        return;
    }
    
    console.log('saveProduct called');
    
    // Validate all required fields
    const form = document.getElementById('product-form');
    if (!form) {
        showToast('Erro: Formulário de produto não encontrado!', 'error');
        console.error('Product form not found');
        return;
    }
    
    const requiredFields = form.querySelectorAll('input[required], select[required]');
    console.log('Required fields found:', requiredFields.length);
    
    let allValid = true;
    let invalidFields = [];
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            allValid = false;
            invalidFields.push(field.id || field.name || 'unknown');
            field.classList.add('invalid');
        } else {
            field.classList.remove('invalid');
        }
    });
    
    console.log('Form validation result:', { allValid, invalidFields });
    
    // Check if using multiple sizes
    const hasSizesRadio = document.querySelector('input[name="has-sizes"]:checked');
    const hasMultipleSizes = hasSizesRadio ? hasSizesRadio.value === 'yes' : false;
    
    console.log('Has multiple sizes:', hasMultipleSizes);
    
    if (hasMultipleSizes) {
        const sizeInputs = document.querySelectorAll('.size-name, .size-price');
        console.log('Size inputs found:', sizeInputs.length);
        
        sizeInputs.forEach(input => {
            if (input.required && !input.value.trim()) {
                allValid = false;
                invalidFields.push('size-field');
                input.classList.add('invalid');
            }
        });
    }
    
    if (!allValid) {
        showToast(`Por favor, corrija os campos inválidos: ${invalidFields.join(', ')}`, 'error');
        console.error('Validation failed for fields:', invalidFields);
        return;
    }
    
    // Collect all form data and sanitize inputs
    const productIdElement = document.getElementById('product-id');
    const productTypeElement = document.getElementById('product-type');
    const productNameElement = document.getElementById('product-name');
    const productDescElement = document.getElementById('product-description');
    const productCategoryElement = document.getElementById('product-category-specific');
    const productPrepTimeElement = document.getElementById('product-prep-time');
    const productAvailableElement = document.getElementById('product-available');
    const productFeaturedElement = document.getElementById('product-featured');
    const productPriceElement = document.getElementById('product-price');
    
    // Check if essential elements exist
    const missingElements = [];
    if (!productIdElement) missingElements.push('product-id');
    if (!productTypeElement) missingElements.push('product-type');
    if (!productNameElement) missingElements.push('product-name');
    if (!productPriceElement && !hasMultipleSizes) missingElements.push('product-price');
    
    if (missingElements.length > 0) {
        showToast(`Erro: Elementos não encontrados: ${missingElements.join(', ')}`, 'error');
        console.error('Missing form elements:', missingElements);
        return;
    }
    
    const productData = {
        id: sanitizeInput(productIdElement.value.trim()),
        type: sanitizeInput(productTypeElement.value),
        name: sanitizeInput(productNameElement.value.trim()),
        description: productDescElement ? sanitizeInput(productDescElement.value.trim()) : '',
        categorySpecific: productCategoryElement ? sanitizeInput(productCategoryElement.value) : '',
        prepTime: productPrepTimeElement ? productPrepTimeElement.value : '15',
        available: productAvailableElement ? productAvailableElement.checked : true,
        featured: productFeaturedElement ? productFeaturedElement.checked : false,
        createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    console.log('Product data collected:', productData);
    
    // Handle pricing
    if (hasMultipleSizes) {
        console.log('Processing multiple sizes');
        productData.hasMultipleSizes = true;
        productData.sizes = [];
        
        const sizeItems = document.querySelectorAll('.size-item');
        console.log('Size items found:', sizeItems.length);
        
        sizeItems.forEach(item => {
            const sizeNameElement = item.querySelector('.size-name');
            const sizePriceElement = item.querySelector('.size-price');
            const sizeDescElement = item.querySelector('.size-description');
            
            if (sizeNameElement && sizePriceElement) {
                const sizeName = sanitizeInput(sizeNameElement.value.trim());
                const sizePrice = parseFloat(sizePriceElement.value);
                const sizeDescription = sizeDescElement ? sanitizeInput(sizeDescElement.value.trim()) : '';
                
                if (sizeName && sizePrice >= 0) {
                    productData.sizes.push({
                        name: sizeName,
                        price: sizePrice.toFixed(2),
                        description: sizeDescription
                    });
                }
            }
        });
        
        if (productData.sizes.length === 0) {
            showToast('Adicione pelo menos um tamanho com preço!', 'error');
            return;
        }
        
        // Set main price as the lowest size price for compatibility
        productData.price = Math.min(...productData.sizes.map(s => parseFloat(s.price))).toFixed(2);
    } else {
        console.log('Processing single price');
        productData.hasMultipleSizes = false;
        
        if (!productPriceElement || !productPriceElement.value) {
            showToast('Informe o preço do produto!', 'error');
            return;
        }
        
        const priceValue = parseFloat(productPriceElement.value);
        if (isNaN(priceValue) || priceValue <= 0) {
            showToast('Preço deve ser um valor válido e maior que zero!', 'error');
            return;
        }
        
        productData.price = priceValue.toFixed(2);
        productData.sizes = [];
    }
    
    console.log('Final product data:', productData);
    
    // Check for duplicate ID (only if not editing)
    if (!editingProduct && products.some(product => product.id === productData.id)) {
        showToast('ID já existe! Escolha outro ID.', 'error');
        document.getElementById('product-id').focus();
        return;
    }
    
    if (editingProduct) {
        // Update existing product
        const index = products.findIndex(p => p.id === editingProduct.id);
        products[index] = { ...editingProduct, ...productData };
        
        logSecurityEvent('product_updated', {
            productId: productData.id,
            productName: productData.name
        });
        
        showToast('Produto atualizado com sucesso!');
    } else {
        // Add new product
        products.push(productData);
        
        logSecurityEvent('product_created', {
            productId: productData.id,
            productName: productData.name
        });
        
        showToast('Produto cadastrado com sucesso!');
    }
    
    // Reset form
    editingProduct = null;
    
    saveData();
    loadProductsTable();
    updateDashboard();
    closeModal('product-modal');
}

function loadProductsTable() {
    const tbody = document.querySelector('#products-table tbody');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = tbody.insertRow();
        
        // Format price display
        let priceDisplay = '';
        if (product.hasMultipleSizes && product.sizes && product.sizes.length > 0) {
            const prices = product.sizes.map(s => parseFloat(s.price));
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            
            if (minPrice === maxPrice) {
                priceDisplay = `R$ ${minPrice.toFixed(2).replace('.', ',')}`;
            } else {
                priceDisplay = `R$ ${minPrice.toFixed(2).replace('.', ',')} - ${maxPrice.toFixed(2).replace('.', ',')}`;
            }
        } else {
            priceDisplay = `R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}`;
        }
        
        // Status indicator
        const status = product.available !== false ? 
            '<span class="status-available"><i class="fas fa-check-circle"></i> Disponível</span>' : 
            '<span class="status-unavailable"><i class="fas fa-times-circle"></i> Indisponível</span>';
        
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.type}</td>
            <td>
                <div class="product-name">${product.name}</div>
                ${product.description ? `<div class="product-description">${product.description}</div>` : ''}
            </td>
            <td>${priceDisplay}</td>
            <td>${status}</td>
            <td>
                <button class="btn-view" onclick="viewProduct('${product.id}')" title="Ver detalhes">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-edit" onclick="editProduct('${product.id}')" title="Editar produto">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteProduct('${product.id}')" title="Excluir produto">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    });
}

function viewProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    // Populate product details modal
    document.getElementById('view-product-id').textContent = product.id;
    document.getElementById('view-product-name').textContent = product.name || 'Não informado';
    document.getElementById('view-product-type').textContent = product.type || 'Não informado';
    document.getElementById('view-product-description').textContent = product.description || 'Nenhuma descrição';
    document.getElementById('view-product-category-specific').textContent = product.categorySpecific || 'Não informado';
    document.getElementById('view-product-prep-time').textContent = product.prepTime ? `${product.prepTime} minutos` : 'Não informado';
    document.getElementById('view-product-available').textContent = product.available !== false ? 'Sim' : 'Não';
    document.getElementById('view-product-featured').textContent = product.featured ? 'Sim' : 'Não';
    
    // Handle pricing information
    const pricesContainer = document.getElementById('view-product-prices');
    if (product.hasMultipleSizes && product.sizes && product.sizes.length > 0) {
        let pricesHtml = '';
        product.sizes.forEach(size => {
            pricesHtml += `
                <div class="price-item">
                    <span class="size-name">${size.name}</span>
                    <span class="size-price">R$ ${parseFloat(size.price).toFixed(2).replace('.', ',')}</span>
                    ${size.description ? `<span class="size-desc">${size.description}</span>` : ''}
                </div>
            `;
        });
        pricesContainer.innerHTML = pricesHtml;
    } else {
        pricesContainer.innerHTML = `
            <div class="price-item">
                <span class="size-name">Preço único</span>
                <span class="size-price">R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    }
    
    // Format and show creation/update dates
    if (product.createdAt) {
        const createdDate = new Date(product.createdAt).toLocaleString('pt-BR');
        document.getElementById('view-product-created').textContent = createdDate;
    } else {
        document.getElementById('view-product-created').textContent = 'Não informado';
    }
    
    if (product.updatedAt) {
        const updatedDate = new Date(product.updatedAt).toLocaleString('pt-BR');
        document.getElementById('view-product-updated').textContent = updatedDate;
    } else {
        document.getElementById('view-product-updated').textContent = 'Não informado';
    }
    
    openModal('view-product-modal');
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    editingProduct = product;
    
    // Populate basic information
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-type').value = product.type || '';
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-description').value = product.description || '';
    
    // Update category-specific fields
    updateProductFields();
    document.getElementById('product-category-specific').value = product.categorySpecific || '';
    
    // Populate additional options
    document.getElementById('product-prep-time').value = product.prepTime || '';
    document.getElementById('product-available').checked = product.available !== false;
    document.getElementById('product-featured').checked = product.featured || false;
    
    // Handle pricing/sizes
    if (product.hasMultipleSizes && product.sizes && product.sizes.length > 0) {
        // Set multiple sizes option
        document.querySelector('input[name="has-sizes"][value="yes"]').checked = true;
        toggleSizes();
        
        // Clear existing sizes and add product sizes
        const sizesContainer = document.querySelector('.sizes-container');
        sizesContainer.innerHTML = '';
        
        product.sizes.forEach((size, index) => {
            addSizeOption();
            const sizeItems = document.querySelectorAll('.size-item');
            const currentItem = sizeItems[sizeItems.length - 1];
            
            currentItem.querySelector('.size-name').value = size.name || '';
            currentItem.querySelector('.size-price').value = size.price || '';
            currentItem.querySelector('.size-description').value = size.description || '';
        });
    } else {
        // Set single price option
        document.querySelector('input[name="has-sizes"][value="no"]').checked = true;
        toggleSizes();
        document.getElementById('product-price').value = product.price || '';
    }
    
    document.getElementById('product-modal-title').textContent = 'Editar Produto';
    document.getElementById('product-id').disabled = true;
    
    openModal('product-modal');
}

function deleteProduct(id) {
    // Security check for delete permission
    if (!validateAction('delete')) {
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        const productToDelete = products.find(p => p.id === id);
        
        logSecurityEvent('product_deleted', {
            productId: id,
            productName: productToDelete ? productToDelete.name : 'unknown'
        });
        
        products = products.filter(p => p.id !== id);
        saveData();
        loadProductsTable();
        updateDashboard();
        showToast('Produto excluído com sucesso!');
    }
}

function searchProducts() {
    const search = document.getElementById('product-search').value.toLowerCase();
    const rows = document.querySelectorAll('#products-table tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
}

// ===============================
// ORDER MANAGEMENT
// ===============================

function updateOrderSelects() {
    const clientSelect = document.getElementById('order-client');
    const productSelect = document.getElementById('order-product');
    
    // Clear options
    clientSelect.innerHTML = '<option value="">Selecione o cliente</option>';
    productSelect.innerHTML = '<option value="">Selecione o produto</option>';
    
    // Add clients
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = `${client.id} - ${client.name}`;
        clientSelect.appendChild(option);
    });
    
    // Add products
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.id} - ${product.name} - R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}`;
        productSelect.appendChild(option);
    });
}

function addProductToOrder() {
    console.log('addProductToOrder called');
    
    const clientId = document.getElementById('order-client').value;
    const productId = document.getElementById('order-product').value;
    const quantity = parseInt(document.getElementById('order-quantity').value) || 1;
    const notes = document.getElementById('order-product-notes').value.trim();
    
    console.log('Form values:', { clientId, productId, quantity, notes });
    
    if (!clientId) {
        showToast('Selecione um cliente primeiro!', 'error');
        console.log('Error: No client selected');
        return;
    }
    
    if (!productId) {
        showToast('Selecione um produto!', 'error');
        console.log('Error: No product selected');
        return;
    }
    
    const client = clients.find(c => c.id === clientId);
    const product = products.find(p => p.id === productId);
    
    console.log('Found client:', client);
    console.log('Found product:', product);
    
    if (!client || !product) {
        showToast('Cliente ou produto não encontrado!', 'error');
        console.log('Error: Client or product not found');
        return;
    }
    
    // Get size and price
    let size = '';
    let price = parseFloat(product.price);
    
    const sizeSelect = document.getElementById('order-product-size');
    if (product.sizes && product.sizes.length > 0) {
        if (!sizeSelect.value) {
            showToast('Selecione o tamanho do produto!', 'error');
            console.log('Error: No size selected');
            return;
        }
        size = sizeSelect.value;
        const selectedOption = sizeSelect.options[sizeSelect.selectedIndex];
        price = parseFloat(selectedOption.dataset.price);
    }
    
    const orderItem = {
        id: Date.now().toString(),
        clientId,
        clientName: client.name,
        productId,
        productName: product.name,
        size,
        price: price.toFixed(2),
        quantity,
        total: (price * quantity).toFixed(2),
        notes
    };
    
    console.log('Created order item:', orderItem);
    
    orderItems.push(orderItem);
    console.log('Current orderItems:', orderItems);
    
    // Clear product form
    document.getElementById('order-product').value = '';
    document.getElementById('order-product-size').value = '';
    document.getElementById('order-quantity').value = '1';
    document.getElementById('order-product-notes').value = '';
    document.getElementById('product-info').style.display = 'none';
    document.getElementById('product-size-group').style.display = 'none';
    
    updateOrderDisplay();
    updateOrderTotal();
    validateOrderForm();
    showToast('Produto adicionado ao pedido!');
    console.log('Product added successfully');
}

function updateOrderDisplay() {
    const container = document.getElementById('order-items');
    
    if (!orderItems || orderItems.length === 0) {
        container.innerHTML = `
            <div class="empty-order">
                <i class="fas fa-shopping-cart"></i>
                <p>Nenhum item adicionado ainda</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    orderItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item';
        itemDiv.innerHTML = `
            <div class="order-item-header">
                <div class="order-item-name">${item.productName}</div>
                <div class="order-item-price">R$ ${parseFloat(item.total).toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="order-item-details">
                ${item.size ? `<div><strong>Tamanho:</strong> ${item.size}</div>` : ''}
                <div><strong>Qtd:</strong> ${item.quantity}</div>
                <div><strong>Preço Unit:</strong> R$ ${parseFloat(item.price).toFixed(2).replace('.', ',')}</div>
            </div>
            ${item.notes ? `<div class="order-item-notes"><strong>Obs:</strong> ${item.notes}</div>` : ''}
            <button type="button" class="btn-remove-item" onclick="removeOrderItem(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(itemDiv);
    });
}

function removeOrderItem(index) {
    orderItems.splice(index, 1);
    updateOrderDisplay();
    updateOrderTotal();
    validateOrderForm();
    showToast('Item removido do pedido!');
}

function clearOrderForm() {
    orderItems = [];
    updateOrderDisplay();
    updateOrderTotal();
    document.getElementById('order-form').reset();
    document.getElementById('client-info').style.display = 'none';
    document.getElementById('delivery-options').style.display = 'none';
    document.getElementById('product-info').style.display = 'none';
    document.getElementById('product-size-group').style.display = 'none';
    document.getElementById('money-change-group').style.display = 'none';
    document.getElementById('change-amount').style.display = 'none';
    validateOrderForm();
}

function saveOrder() {
    // Security check for write permission
    if (!validateAction('write')) {
        return;
    }
    
    console.log('saveOrder called');
    console.log('orderItems:', orderItems);
    
    // Check if all required elements exist
    const clientElement = document.getElementById('order-client');
    const paymentElement = document.getElementById('order-payment');
    const deliveryElement = document.getElementById('order-type');
    const addressElement = document.getElementById('order-delivery-address');
    const statusElement = document.getElementById('order-status');
    const priorityElement = document.getElementById('order-priority');
    const notesElement = document.getElementById('order-notes');
    
    if (!clientElement || !paymentElement || !deliveryElement) {
        showToast('Erro: Elementos do formulário não encontrados!', 'error');
        console.error('Missing form elements');
        return;
    }
    
    const clientId = sanitizeInput(clientElement.value);
    const paymentMethod = sanitizeInput(paymentElement.value);
    const deliveryType = sanitizeInput(deliveryElement.value);
    const deliveryAddress = addressElement ? sanitizeInput(addressElement.value) : '';
    const orderStatus = statusElement ? sanitizeInput(statusElement.value) : 'pendente';
    const orderPriority = priorityElement ? sanitizeInput(priorityElement.value) : 'normal';
    const orderNotes = notesElement ? sanitizeInput(notesElement.value) : '';
    
    console.log('Form values:', {
        clientId,
        paymentMethod,
        deliveryType,
        deliveryAddress,
        orderStatus,
        orderPriority,
        orderNotes
    });
    
    if (!clientId) {
        showToast('Selecione um cliente!', 'error');
        console.log('Error: No client selected');
        return;
    }
    
    if (!orderItems || orderItems.length === 0) {
        showToast('Adicione pelo menos um produto ao pedido!', 'error');
        console.log('Error: No items in order');
        return;
    }
    
    if (!paymentMethod) {
        showToast('Selecione a forma de pagamento!', 'error');
        console.log('Error: No payment method');
        return;
    }
    
    if (!deliveryType) {
        showToast('Selecione o tipo de entrega!', 'error');
        console.log('Error: No delivery type');
        return;
    }
    
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
        showToast('Informe o endereço de entrega!', 'error');
        console.log('Error: No delivery address');
        return;
    }
    
    const client = clients.find(c => c.id === clientId);
    if (!client) {
        showToast('Cliente não encontrado!', 'error');
        console.log('Error: Client not found');
        return;
    }
    
    console.log('All validations passed, creating order...');
    
    const now = new Date();
    const orderId = `PED${Date.now()}`;
    
    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + parseFloat(item.total), 0);
    
    let deliveryFee = 0;
    if (deliveryType === 'delivery') {
        const deliveryFeeElement = document.getElementById('order-delivery-fee');
        deliveryFee = deliveryFeeElement ? parseFloat(deliveryFeeElement.value) || 5.00 : 5.00;
    }
    
    const total = subtotal + deliveryFee;
    
    console.log('Order totals:', { subtotal, deliveryFee, total });
    
    const order = {
        id: orderId,
        date: now.toISOString(),
        client: client.name,
        clientId: clientId,
        items: [...orderItems],
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        total: total.toFixed(2),
        paymentMethod,
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : '',
        status: orderStatus,
        priority: orderPriority,
        notes: orderNotes,
        createdAt: now.toISOString()
    };
    
    console.log('Order created:', order);
    
    logSecurityEvent('order_created', {
        orderId: orderId,
        clientId: clientId,
        total: total.toFixed(2),
        itemCount: orderItems.length
    });
    
    orders.push(order);
    saveData();
    loadOrdersTable();
    updateDashboard();
    
    // Update specific dashboard sections with real-time data
    updateTopProducts('all');
    updateHourlyChart();
    
    closeModal('order-modal');
    clearOrderForm();
    
    console.log('Order saved successfully');
    showToast(`Pedido ${orderId} registrado com sucesso! Total: R$ ${total.toFixed(2).replace('.', ',')}`);
}


function loadOrdersTable() {
    const tbody = document.querySelector('#orders-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    orders.slice().reverse().forEach((order, index) => {
        const row = tbody.insertRow();
        const itemsCount = order.items ? order.items.length : 1;
        const itemsText = itemsCount > 1 ? `${itemsCount} itens` : '1 item';
        
        row.innerHTML = `
            <td>${formatDateTime(order.date)}</td>
            <td>${order.client}</td>
            <td>${itemsText}</td>
            <td>R$ ${parseFloat(order.total).toFixed(2).replace('.', ',')}</td>
            <td>
                <span class="status-badge status-${order.status || 'pending'}">${getStatusText(order.status || 'pending')}</span>
            </td>
            <td>${order.paymentMethod || order.payment || 'N/A'}</td>
            <td>
                <button class="btn-view" onclick="viewOrderDetails('${order.id || orders.length - 1 - index}')" title="Ver detalhes">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-delete" onclick="deleteOrder(${orders.length - 1 - index})" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    });
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendente',
        'preparing': 'Preparando',
        'ready': 'Pronto',
        'delivered': 'Entregue',
        'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
}

function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId) || orders[parseInt(orderId)];
    if (!order) return;
    
    // Populate basic information
    document.getElementById('view-order-id').textContent = order.id || `Pedido #${parseInt(orderId) + 1}`;
    document.getElementById('view-order-date').textContent = formatDateTime(order.date);
    document.getElementById('view-order-client').textContent = order.client;
    
    // Status with badge
    const statusElement = document.getElementById('view-order-status');
    const status = order.status || 'pending';
    statusElement.innerHTML = `<span class="status-badge status-${status}">${getStatusText(status)}</span>`;
    
    document.getElementById('view-order-priority').textContent = order.priority || 'Normal';
    
    // Delivery type and address
    const deliveryType = order.deliveryType || order.type || 'pickup';
    document.getElementById('view-order-delivery-type').textContent = 
        deliveryType === 'delivery' ? 'Entrega' : 'Retirada no Local';
    
    const deliveryAddressSection = document.getElementById('delivery-address-section');
    if (deliveryType === 'delivery' && order.deliveryAddress) {
        document.getElementById('view-order-delivery-address').textContent = order.deliveryAddress;
        deliveryAddressSection.style.display = 'block';
    } else {
        deliveryAddressSection.style.display = 'none';
    }
    
    // Populate items
    const itemsContainer = document.getElementById('view-order-items');
    if (order.items && order.items.length > 0) {
        itemsContainer.innerHTML = order.items.map(item => `
            <div class="price-item">
                <div class="price-info">
                    <span class="price-label">${item.productName}</span>
                    ${item.size ? `<span class="size-desc">Tamanho: ${item.size}</span>` : ''}
                    <span class="size-desc">Quantidade: ${item.quantity}</span>
                    ${item.notes ? `<span class="size-desc">Obs: ${item.notes}</span>` : ''}
                </div>
                <span class="price-value">R$ ${parseFloat(item.total).toFixed(2).replace('.', ',')}</span>
            </div>
        `).join('');
    } else {
        // Handle old format orders
        itemsContainer.innerHTML = `
            <div class="price-item">
                <div class="price-info">
                    <span class="price-label">${order.product || 'Produto não especificado'}</span>
                    <span class="size-desc">Quantidade: ${order.quantity || 1}</span>
                </div>
                <span class="price-value">R$ ${parseFloat(order.total).toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    }
    
    // Payment and totals
    document.getElementById('view-order-payment').textContent = order.paymentMethod || order.payment || 'Não informado';
    
    // Subtotal
    if (order.subtotal) {
        document.getElementById('view-order-subtotal').textContent = `R$ ${parseFloat(order.subtotal).toFixed(2).replace('.', ',')}`;
    } else {
        document.getElementById('view-order-subtotal').textContent = `R$ ${parseFloat(order.total).toFixed(2).replace('.', ',')}`;
    }
    
    // Delivery fee
    const deliveryFeeSection = document.getElementById('delivery-fee-section');
    if (order.deliveryFee && parseFloat(order.deliveryFee) > 0) {
        document.getElementById('view-order-delivery-fee').textContent = `R$ ${parseFloat(order.deliveryFee).toFixed(2).replace('.', ',')}`;
        deliveryFeeSection.style.display = 'block';
    } else {
        deliveryFeeSection.style.display = 'none';
    }
    
    // Discount
    const discountSection = document.getElementById('discount-section');
    if (order.discount && parseFloat(order.discount) > 0) {
        document.getElementById('view-order-discount').textContent = `- R$ ${parseFloat(order.discount).toFixed(2).replace('.', ',')}`;
        discountSection.style.display = 'block';
    } else {
        discountSection.style.display = 'none';
    }
    
    // Total
    document.getElementById('view-order-total').innerHTML = `<strong>R$ ${parseFloat(order.total).toFixed(2).replace('.', ',')}</strong>`;
    
    // Notes
    const notesSection = document.getElementById('notes-section');
    if (order.notes && order.notes.trim()) {
        document.getElementById('view-order-notes').textContent = order.notes;
        notesSection.style.display = 'block';
    } else {
        notesSection.style.display = 'none';
    }
    
    // System information
    if (order.createdAt || order.date) {
        const createdDate = new Date(order.createdAt || order.date).toLocaleString('pt-BR');
        document.getElementById('view-order-created').textContent = createdDate;
    } else {
        document.getElementById('view-order-created').textContent = 'Não informado';
    }
    
    // Open modal
    openModal('view-order-modal');
}

function editOrder(orderId) {
    closeModal('view-order-modal');
    // TODO: Implement edit order functionality
    showToast('Funcionalidade de edição em desenvolvimento', 'info');
}


function deleteOrder(index) {
    // Security check for delete permission
    if (!validateAction('delete')) {
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
        const orderToDelete = orders[index];
        
        logSecurityEvent('order_deleted', {
            orderId: orderToDelete ? orderToDelete.id : 'unknown',
            orderIndex: index
        });
        
        orders.splice(index, 1);
        saveData();
        loadOrdersTable();
        updateDashboard();
        showToast('Pedido excluído com sucesso!');
    }
}

function searchOrders() {
    const search = document.getElementById('order-search').value.toLowerCase();
    const rows = document.querySelectorAll('#orders-table tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
}

// ===============================
// ORDER FORM FUNCTIONS
// ===============================

function updateClientInfo() {
    const clientSelect = document.getElementById('order-client');
    const clientId = clientSelect.value;
    const clientInfo = document.getElementById('client-info');
    
    if (!clientId) {
        clientInfo.style.display = 'none';
        return;
    }
    
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    // Update client info display
    document.getElementById('client-phone-display').textContent = client.phone;
    document.getElementById('client-address-display').textContent = 
        `${client.address}, ${client.number} - ${client.neighborhood}, ${client.city} - ${client.state}`;
    
    // Auto-fill delivery address if delivery is selected
    const orderType = document.getElementById('order-type').value;
    if (orderType === 'delivery') {
        document.getElementById('order-delivery-address').value = 
            `${client.address}, ${client.number} - ${client.neighborhood}, ${client.city} - ${client.state}`;
    }
    
    clientInfo.style.display = 'block';
    validateOrderForm();
}

function updateDeliveryOptions() {
    const orderType = document.getElementById('order-type').value;
    const deliveryOptions = document.getElementById('delivery-options');
    const deliveryFeeRow = document.getElementById('delivery-fee-row');
    
    if (orderType === 'delivery') {
        deliveryOptions.style.display = 'block';
        deliveryFeeRow.style.display = 'block';
        
        // Auto-fill delivery address with client info
        const clientId = document.getElementById('order-client').value;
        if (clientId) {
            const client = clients.find(c => c.id === clientId);
            if (client) {
                document.getElementById('order-delivery-address').value = 
                    `${client.address}, ${client.number} - ${client.neighborhood}, ${client.city} - ${client.state}`;
            }
        }
    } else {
        deliveryOptions.style.display = 'none';
        deliveryFeeRow.style.display = 'none';
    }
    
    updateOrderTotal();
    validateOrderForm();
}

function updateProductInfo() {
    const productSelect = document.getElementById('order-product');
    const productId = productSelect.value;
    const productInfo = document.getElementById('product-info');
    const sizeGroup = document.getElementById('product-size-group');
    
    if (!productId) {
        productInfo.style.display = 'none';
        sizeGroup.style.display = 'none';
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Update product info display
    document.getElementById('selected-product-name').textContent = product.name;
    
    // Handle sizes if available
    const sizeSelect = document.getElementById('order-product-size');
    if (product.sizes && product.sizes.length > 0) {
        sizeSelect.innerHTML = '<option value="">Selecione o tamanho</option>';
        product.sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size.name;
            option.dataset.price = size.price;
            option.textContent = `${size.name} - R$ ${parseFloat(size.price).toFixed(2).replace('.', ',')}`;
            sizeSelect.appendChild(option);
        });
        sizeGroup.style.display = 'block';
        document.getElementById('selected-product-price').textContent = 'Selecione o tamanho';
    } else {
        sizeGroup.style.display = 'none';
        document.getElementById('selected-product-price').textContent = `R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}`;
        updateProductPrice();
    }
    
    productInfo.style.display = 'block';
}

function updateProductPrice() {
    const productSelect = document.getElementById('order-product');
    const sizeSelect = document.getElementById('order-product-size');
    const quantity = parseInt(document.getElementById('order-quantity').value) || 1;
    
    if (!productSelect.value) return;
    
    const product = products.find(p => p.id === productSelect.value);
    if (!product) return;
    
    let price = parseFloat(product.price);
    
    // Check if size is selected
    if (product.sizes && product.sizes.length > 0) {
        if (!sizeSelect.value) return;
        const selectedOption = sizeSelect.options[sizeSelect.selectedIndex];
        price = parseFloat(selectedOption.dataset.price);
        document.getElementById('selected-product-price').textContent = `R$ ${price.toFixed(2).replace('.', ',')}`;
    }
    
    const subtotal = price * quantity;
    document.getElementById('product-subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
}

function updatePaymentInfo() {
    const paymentMethod = document.getElementById('order-payment').value;
    const changeGroup = document.getElementById('money-change-group');
    
    if (paymentMethod === 'Dinheiro') {
        changeGroup.style.display = 'block';
    } else {
        changeGroup.style.display = 'none';
        document.getElementById('change-amount').style.display = 'none';
    }
    
    validateOrderForm();
}

function calculateChange() {
    const total = parseFloat(document.getElementById('order-total-value').textContent.replace('R$ ', '').replace(',', '.'));
    const changeFor = parseFloat(document.getElementById('order-change-for').value) || 0;
    const changeDisplay = document.getElementById('change-amount');
    const changeValue = document.getElementById('change-value');
    
    if (changeFor > 0) {
        const change = changeFor - total;
        changeValue.textContent = `R$ ${Math.max(0, change).toFixed(2).replace('.', ',')}`;
        changeDisplay.style.display = 'block';
        
        if (change < 0) {
            changeDisplay.style.background = '#f8d7da';
            changeDisplay.innerHTML = `<span style="color: #721c24;"><strong>Valor insuficiente! Faltam: R$ ${Math.abs(change).toFixed(2).replace('.', ',')}</strong></span>`;
        } else {
            changeDisplay.style.background = '#d4edda';
            changeDisplay.innerHTML = `<span>Troco: <strong id="change-value">R$ ${change.toFixed(2).replace('.', ',')}</strong></span>`;
        }
    } else {
        changeDisplay.style.display = 'none';
    }
}

function updateOrderTotal() {
    const subtotal = orderItems.reduce((sum, item) => sum + parseFloat(item.total), 0);
    const orderType = document.getElementById('order-type').value;
    const deliveryFee = orderType === 'delivery' ? parseFloat(document.getElementById('order-delivery-fee').value) || 5.00 : 0;
    const total = subtotal + deliveryFee;
    
    document.getElementById('order-subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('order-delivery-total').textContent = `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`;
    document.getElementById('order-total-value').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    
    calculateChange();
}

function validateOrderForm() {
    const clientId = document.getElementById('order-client').value;
    const paymentMethod = document.getElementById('order-payment').value;
    const orderType = document.getElementById('order-type').value;
    const deliveryAddress = document.getElementById('order-delivery-address').value;
    const hasItems = orderItems.length > 0;
    
    let isValid = clientId && paymentMethod && orderType && hasItems;
    
    // Check delivery address if delivery is selected
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
        isValid = false;
    }
    
    const finalizeBtn = document.getElementById('finalize-order-btn');
    finalizeBtn.disabled = !isValid;
    
    if (isValid) {
        finalizeBtn.classList.remove('btn-disabled');
    } else {
        finalizeBtn.classList.add('btn-disabled');
    }
}

// ===============================
// ENHANCED ORDER MANAGEMENT FUNCTIONS
// ===============================

function updateClientInfo() {
    const clientSelect = document.getElementById('client-select');
    const clientId = clientSelect.value;
    
    if (!clientId) {
        document.getElementById('client-info-display').style.display = 'none';
        return;
    }
    
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    // Update client info display
    document.getElementById('display-client-name').textContent = client.name;
    document.getElementById('display-client-phone').textContent = client.phone;
    document.getElementById('display-client-address').textContent = 
        `${client.address}, ${client.number} - ${client.neighborhood}, ${client.city} - ${client.state}`;
    
    // Set delivery address if delivery is selected
    if (document.getElementById('delivery-delivery') && document.getElementById('delivery-delivery').checked) {
        document.getElementById('delivery-address').value = 
            `${client.address}, ${client.number} - ${client.neighborhood}, ${client.city} - ${client.state}`;
    }
    
    document.getElementById('client-info-display').style.display = 'block';
}

function updateProductInfo() {
    const productSelect = document.getElementById('product-select');
    const productId = productSelect.value;
    
    if (!productId) {
        document.getElementById('product-info-display').style.display = 'none';
        if (document.getElementById('btn-add-product')) {
            document.getElementById('btn-add-product').disabled = true;
        }
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Update product info display
    document.getElementById('display-product-name').textContent = product.name;
    document.getElementById('display-product-category').textContent = product.category;
    document.getElementById('display-product-description').textContent = product.description || 'Sem descrição';
    
    // Update size options if available
    const sizeSelect = document.getElementById('product-size');
    if (sizeSelect) {
        sizeSelect.innerHTML = '';
        
        if (product.sizes && product.sizes.length > 0) {
            product.sizes.forEach(size => {
                const option = document.createElement('option');
                option.value = size.name;
                option.dataset.price = size.price;
                option.textContent = `${size.name} - R$ ${parseFloat(size.price).toFixed(2).replace('.', ',')}`;
                sizeSelect.appendChild(option);
            });
            document.getElementById('size-selection').style.display = 'block';
            updateProductPrice();
        } else {
            document.getElementById('size-selection').style.display = 'none';
            document.getElementById('display-product-price').textContent = `R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}`;
        }
    } else {
        document.getElementById('display-product-price').textContent = `R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}`;
    }
    
    document.getElementById('product-info-display').style.display = 'block';
    if (document.getElementById('btn-add-product')) {
        document.getElementById('btn-add-product').disabled = false;
    }
    updateProductTotal();
}

function updateProductPrice() {
    const sizeSelect = document.getElementById('product-size');
    if (!sizeSelect) return;
    
    const selectedOption = sizeSelect.options[sizeSelect.selectedIndex];
    
    if (selectedOption && selectedOption.dataset.price) {
        const price = parseFloat(selectedOption.dataset.price);
        document.getElementById('display-product-price').textContent = `R$ ${price.toFixed(2).replace('.', ',')}`;
        updateProductTotal();
    }
}

function updateProductTotal() {
    const quantityInput = document.getElementById('product-quantity');
    const priceElement = document.getElementById('display-product-price');
    
    if (!quantityInput || !priceElement) return;
    
    const quantity = parseInt(quantityInput.value) || 1;
    const priceText = priceElement.textContent;
    const price = parseFloat(priceText.replace('R$ ', '').replace(',', '.'));
    
    if (!isNaN(price)) {
        const total = price * quantity;
        document.getElementById('display-product-total').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
}

function addProductToOrderEnhanced() {
    const clientId = document.getElementById('client-select').value;
    const productId = document.getElementById('product-select').value;
    const quantity = parseInt(document.getElementById('product-quantity').value) || 1;
    const notes = document.getElementById('product-notes').value.trim();
    
    if (!clientId) {
        showToast('Selecione um cliente primeiro!', 'error');
        return;
    }
    
    if (!productId) {
        showToast('Selecione um produto!', 'error');
        return;
    }
    
    const client = clients.find(c => c.id === clientId);
    const product = products.find(p => p.id === productId);
    
    if (!client || !product) {
        showToast('Cliente ou produto não encontrado!', 'error');
        return;
    }
    
    // Get size and price
    let size = '';
    let price = parseFloat(product.price);
    
    const sizeSelect = document.getElementById('product-size');
    if (sizeSelect && sizeSelect.style.display !== 'none' && sizeSelect.value) {
        size = sizeSelect.value;
        const selectedOption = sizeSelect.options[sizeSelect.selectedIndex];
        price = parseFloat(selectedOption.dataset.price);
    }
    
    const orderItem = {
        id: Date.now().toString(),
        clientId,
        clientName: client.name,
        productId,
        productName: product.name,
        size,
        price: price.toFixed(2),
        quantity,
        total: (price * quantity).toFixed(2),
        notes
    };
    
    // Add to order items
    if (!orderItems) {
        orderItems = [];
    }
    orderItems.push(orderItem);
    
    // Clear product form
    document.getElementById('product-select').value = '';
    document.getElementById('product-quantity').value = '1';
    document.getElementById('product-notes').value = '';
    document.getElementById('product-info-display').style.display = 'none';
    if (document.getElementById('btn-add-product')) {
        document.getElementById('btn-add-product').disabled = true;
    }
    
    updateOrderDisplayEnhanced();
    showToast('Produto adicionado ao pedido!');
}

function updateOrderDisplayEnhanced() {
    const container = document.getElementById('order-items-list');
    if (!container) return;
    
    if (!orderItems || orderItems.length === 0) {
        container.innerHTML = `
            <div class="empty-order">
                <i class="fas fa-shopping-cart"></i>
                <p>Nenhum produto adicionado</p>
            </div>
        `;
        updateOrderTotals();
        return;
    }
    
    container.innerHTML = '';
    
    orderItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item';
        itemDiv.innerHTML = `
            <button type="button" class="btn-remove-item" onclick="removeOrderItemEnhanced(${index})">
                <i class="fas fa-times"></i>
            </button>
            <div class="order-item-header">
                <div class="order-item-name">${item.productName}</div>
                <div class="order-item-price">R$ ${parseFloat(item.total).toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="order-item-details">
                ${item.size ? `<div><strong>Tamanho:</strong> ${item.size}</div>` : ''}
                <div><strong>Qtd:</strong> ${item.quantity}</div>
                <div><strong>Preço Unit:</strong> R$ ${parseFloat(item.price).toFixed(2).replace('.', ',')}</div>
            </div>
            ${item.notes ? `<div class="order-item-notes">${item.notes}</div>` : ''}
        `;
        container.appendChild(itemDiv);
    });
    
    updateOrderTotals();
}

function removeOrderItemEnhanced(index) {
    if (!orderItems) return;
    
    orderItems.splice(index, 1);
    updateOrderDisplayEnhanced();
    showToast('Item removido do pedido!');
}

function updateOrderTotals() {
    if (!orderItems) {
        orderItems = [];
    }
    
    const subtotal = orderItems.reduce((sum, item) => sum + parseFloat(item.total), 0);
    
    // Calculate delivery fee
    const deliveryDelivery = document.getElementById('delivery-delivery');
    const isDelivery = deliveryDelivery ? deliveryDelivery.checked : false;
    const deliveryFee = isDelivery ? 5.00 : 0;
    
    // Calculate discount
    const discountInput = document.getElementById('order-discount');
    const discountPercent = discountInput ? parseFloat(discountInput.value) || 0 : 0;
    const discount = (subtotal * discountPercent) / 100;
    
    const total = subtotal + deliveryFee - discount;
    
    // Update display
    const subtotalElement = document.getElementById('subtotal-value');
    const deliveryElement = document.getElementById('delivery-fee-value');
    const discountElement = document.getElementById('discount-value');
    const totalElement = document.getElementById('total-value');
    
    if (subtotalElement) subtotalElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    if (deliveryElement) deliveryElement.textContent = `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`;
    if (discountElement) discountElement.textContent = `R$ ${discount.toFixed(2).replace('.', ',')}`;
    if (totalElement) totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    
    // Update change calculation
    calculateChange();
}

function calculateChange() {
    const totalElement = document.getElementById('total-value');
    const paidInput = document.getElementById('paid-value');
    const changeDisplay = document.getElementById('change-display');
    
    if (!totalElement || !paidInput || !changeDisplay) return;
    
    const total = parseFloat(totalElement.textContent.replace('R$ ', '').replace(',', '.'));
    const paidValue = parseFloat(paidInput.value) || 0;
    
    const change = paidValue - total;
    
    if (paidValue > 0) {
        changeDisplay.style.display = 'block';
        if (change >= 0) {
            changeDisplay.innerHTML = `<strong>Troco: R$ ${change.toFixed(2).replace('.', ',')}</strong>`;
            changeDisplay.style.background = '#d4edda';
            changeDisplay.style.borderColor = '#c3e6cb';
        } else {
            changeDisplay.innerHTML = `<strong>Faltam: R$ ${Math.abs(change).toFixed(2).replace('.', ',')}</strong>`;
            changeDisplay.style.background = '#f8d7da';
            changeDisplay.style.borderColor = '#f5c6cb';
        }
    } else {
        changeDisplay.style.display = 'none';
    }
}

function updateDeliveryOptions() {
    const deliveryDelivery = document.getElementById('delivery-delivery');
    const deliveryAddressGroup = document.getElementById('delivery-address-group');
    
    if (!deliveryDelivery || !deliveryAddressGroup) return;
    
    const isDelivery = deliveryDelivery.checked;
    
    if (isDelivery) {
        deliveryAddressGroup.style.display = 'block';
        updateClientInfo(); // Update delivery address
    } else {
        deliveryAddressGroup.style.display = 'none';
    }
    
    updateOrderTotals();
}

// ===============================
// REPORTS
// ===============================

function updateReportControls() {
    const type = document.getElementById('report-type').value;
    const dateControl = document.getElementById('date-control');
    const monthControl = document.getElementById('month-control');
    
    if (type === 'daily') {
        dateControl.style.display = 'block';
        monthControl.style.display = 'none';
    } else {
        dateControl.style.display = 'none';
        monthControl.style.display = 'block';
    }
}

function generateReport() {
    // Security check for read permission
    if (!validateAction('read')) {
        return;
    }
    
    const type = document.getElementById('report-type').value;
    let filteredOrders = [];
    
    if (type === 'daily') {
        const date = document.getElementById('report-date').value;
        if (!date) {
            showToast('Selecione uma data!', 'error');
            return;
        }
        filteredOrders = orders.filter(order => order.date.startsWith(date));
    } else {
        const month = document.getElementById('report-month').value;
        if (!month) {
            showToast('Selecione um mês!', 'error');
            return;
        }
        filteredOrders = orders.filter(order => order.date.startsWith(month));
    }
    
    // Update summary
    const totalSales = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const totalOrders = filteredOrders.length;
    const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    document.getElementById('report-total-sales').textContent = `R$ ${totalSales.toFixed(2).replace('.', ',')}`;
    document.getElementById('report-total-orders').textContent = totalOrders;
    document.getElementById('report-avg-ticket').textContent = `R$ ${avgTicket.toFixed(2).replace('.', ',')}`;
    
    // Update table
    const tbody = document.querySelector('#reports-table tbody');
    tbody.innerHTML = '';
    
    if (filteredOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">Nenhum pedido encontrado para o período selecionado</td></tr>';
    } else {
        filteredOrders.forEach(order => {
            const row = tbody.insertRow();
            
            // Format date properly
            const orderDate = new Date(order.date);
            const formattedDate = orderDate.toLocaleString('pt-BR');
            
            // Create items string from order items array
            let itemsText = '';
            if (order.items && order.items.length > 0) {
                itemsText = order.items.map(item => `${item.name} (${item.quantity}x)`).join(', ');
            } else {
                itemsText = 'N/A';
            }
            
            row.innerHTML = `
                <td>${order.id || 'N/A'}</td>
                <td>${formattedDate}</td>
                <td>${order.client || 'N/A'}</td>
                <td>${itemsText}</td>
                <td>R$ ${parseFloat(order.total).toFixed(2).replace('.', ',')}</td>
                <td><span class="status-badge ${order.status || 'pendente'}">${order.status || 'Pendente'}</span></td>
            `;
        });
    }
    
    logSecurityEvent('report_generated', {
        reportType: type,
        ordersCount: filteredOrders.length,
        totalSales: totalSales.toFixed(2)
    });
    
    showToast(`Relatório gerado com sucesso! ${filteredOrders.length} pedidos encontrados.`);
}

// ===============================
// PROMOTIONS MANAGEMENT
// ===============================

function savePromotion() {
    // Security check for write permission
    if (!validateAction('write')) {
        return;
    }
    
    const description = sanitizeInput(document.getElementById('promotion-description').value.trim());
    
    if (!description) {
        showToast('Digite a descrição da promoção!', 'error');
        return;
    }
    
    if (editingPromotion) {
        // Update existing promotion
        const index = promotions.findIndex(p => p.id === editingPromotion.id);
        promotions[index].description = description;
        
        logSecurityEvent('promotion_updated', {
            promotionId: editingPromotion.id,
            description: description
        });
        
        showToast('Promoção atualizada com sucesso!');
    } else {
        // Add new promotion
        const promotion = {
            id: Date.now().toString(),
            description,
            date: new Date().toISOString()
        };
        promotions.push(promotion);
        
        logSecurityEvent('promotion_created', {
            promotionId: promotion.id,
            description: description
        });
        
        showToast('Promoção adicionada com sucesso!');
    }
    
    saveData();
    loadPromotions();
    closeModal('promotion-modal');
}

function loadPromotions() {
    const container = document.getElementById('promotions-list');
    container.innerHTML = '';
    
    if (promotions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Nenhuma promoção cadastrada.</p>';
        return;
    }
    
    promotions.forEach(promotion => {
        const card = document.createElement('div');
        card.className = 'promotion-card';
        card.innerHTML = `
            <h4>Promoção</h4>
            <p>${promotion.description}</p>
            <div class="promotion-actions">
                <button class="btn-edit" onclick="editPromotion('${promotion.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="deletePromotion('${promotion.id}')">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function editPromotion(id) {
    const promotion = promotions.find(p => p.id === id);
    if (!promotion) return;
    
    editingPromotion = promotion;
    
    document.getElementById('promotion-description').value = promotion.description;
    document.getElementById('promotion-modal-title').textContent = 'Editar Promoção';
    
    openModal('promotion-modal');
}

function deletePromotion(id) {
    // Security check for delete permission
    if (!validateAction('delete')) {
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir esta promoção?')) {
        const promotionToDelete = promotions.find(p => p.id === id);
        
        logSecurityEvent('promotion_deleted', {
            promotionId: id,
            promotionDescription: promotionToDelete ? promotionToDelete.description : 'unknown'
        });
        
        promotions = promotions.filter(p => p.id !== id);
        saveData();
        loadPromotions();
        showToast('Promoção excluída com sucesso!');
    }
}

// ===============================
// VALIDATION FUNCTIONS
// ===============================

function validateClientId(id) {
    if (!/^\d{3}$/.test(id)) {
        showToast('ID deve ter exatamente 3 dígitos numéricos!', 'error');
        return false;
    }
    return true;
}

function validateClientName(name) {
    if (!/^[A-Za-zÀ-ÿ\s]+$/.test(name)) {
        showToast('Nome deve conter apenas letras e espaços!', 'error');
        return false;
    }
    return true;
}

function validateEmail(email) {
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
        showToast('Email deve estar em formato válido!', 'error');
        return false;
    }
    return true;
}

function validatePhone(phone) {
    if (!/^[\d\s\-\(\)]+$/.test(phone)) {
        showToast('Telefone deve conter apenas números, espaços, parênteses e traços!', 'error');
        return false;
    }
    return true;
}

function validateCep(cep) {
    if (!/^\d{5}-\d{3}$/.test(cep)) {
        showToast('CEP deve estar no formato 00000-000!', 'error');
        return false;
    }
    return true;
}

function validateProductId(id) {
    if (!/^\d{3}$/.test(id)) {
        showToast('ID deve ter exatamente 3 dígitos numéricos!', 'error');
        return false;
    }
    return true;
}

function validatePrice(price) {
    if (isNaN(price) || price <= 0) {
        showToast('Preço deve ser um número maior que zero!', 'error');
        return false;
    }
    return true;
}

// ===============================
// UTILITY FUNCTIONS
// ===============================

function formatDateToBR(date) {
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
}

function formatDateFromBR(date) {
    const parts = date.split('/');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('pt-BR');
}

// ===============================
// SAMPLE DATA (for testing)
// ===============================

function loadSampleData() {
    if (clients.length === 0) {
        clients = [
            {
                id: '001',
                name: 'João Silva',
                birth: '15/08/1990',
                email: 'joao@email.com',
                phone: '11999999999',
                address: 'Rua das Pizzas, 123',
                cep: '01234-567'
            },
            {
                id: '002',
                name: 'Maria Santos',
                birth: '22/03/1985',
                email: 'maria@email.com',
                phone: '11888888888',
                address: 'Av. Margherita, 456',
                cep: '09876-543'
            }
        ];
    }
    
    if (products.length === 0) {
        products = [
            {
                id: '001',
                type: 'Pizza Tradicional',
                name: 'Margherita P',
                price: '35.00'
            },
            {
                id: '002',
                type: 'Pizza Especial',
                name: 'Calabresa com Cebola G',
                price: '45.00'
            },
            {
                id: '003',
                type: 'Bebida',
                name: 'Coca-Cola 1L',
                price: '10.00'
            }
        ];
    }
    
    if (promotions.length === 0) {
        promotions = [
            {
                id: '1',
                description: 'Pizza em dobro toda terça-feira',
                date: new Date().toISOString()
            },
            {
                id: '2',
                description: 'Refrigerante grátis nas compras acima de R$50',
                date: new Date().toISOString()
            }
        ];
    }
    
    saveData();
    loadClientsTable();
    loadProductsTable();
    loadPromotions();
    updateDashboard();
    showToast('Dados de exemplo carregados!');
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// ===============================
// ENHANCED DASHBOARD FUNCTIONS
// ===============================

function setupDashboard() {
    // Update current date
    updateCurrentDate();
    
    // Load recent activity
    loadRecentActivity();
    
    // Load top products
    updateTopProducts('today');
    
    // Load hourly chart
    updateHourlyChart();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        updateDashboard();
        loadRecentActivity();
        updateTopProducts('all');
        updateHourlyChart();
    }, 30000);
}

function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateStr = now.toLocaleDateString('pt-BR', options);
    const timeStr = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const currentDateEl = document.getElementById('current-date');
    if (currentDateEl) {
        currentDateEl.textContent = `${dateStr} - ${timeStr}`;
    }
}

function loadRecentActivity() {
    const timeline = document.getElementById('activity-timeline');
    if (!timeline) return;
    
    const activities = [];
    
    // Get recent orders
    const recentOrders = orders
        .filter(order => {
            const orderDate = new Date(order.date);
            const today = new Date();
            return orderDate.toDateString() === today.toDateString();
        })
        .slice(-3)
        .reverse();
    
    recentOrders.forEach(order => {
        const client = clients.find(c => c.id === order.clientId);
        const product = products.find(p => p.id === order.productId);
        
        activities.push({
            type: 'order',
            icon: 'fas fa-shopping-cart',
            title: `Novo pedido #${order.id || Math.random().toString(36).substr(2, 4)}`,
            description: `${client?.name || 'Cliente'} - ${product?.name || 'Produto'} - R$ ${parseFloat(order.total || 0).toFixed(2).replace('.', ',')}`,
            time: getTimeAgo(new Date(order.date))
        });
    });
    
    // Get recent clients
    const recentClients = clients.slice(-2).reverse();
    recentClients.forEach(client => {
        activities.push({
            type: 'client',
            icon: 'fas fa-user-plus',
            title: 'Novo cliente cadastrado',
            description: `${client.name} se registrou`,
            time: 'há 1 hora'
        });
    });
    
    // Get recent products
    const recentProducts = products.slice(-1);
    recentProducts.forEach(product => {
        activities.push({
            type: 'product',
            icon: 'fas fa-pizza-slice',
            title: 'Produto adicionado',
            description: product.name,
            time: 'há 2 horas'
        });
    });
    
    // Render activities
    timeline.innerHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-description">${activity.description}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `há ${minutes} minutos`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours} horas`;
    
    const days = Math.floor(hours / 24);
    return `há ${days} dias`;
}

function updateTopProducts(period = 'all') {
    // Update active period button if called from UI
    if (event?.target) {
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }
    
    const topProductsEl = document.getElementById('top-products');
    if (!topProductsEl) return;
    
    // Filter orders based on period
    let filteredOrders = orders;
    const now = new Date();
    
    switch(period) {
        case 'today':
            const today = now.toISOString().split('T')[0];
            filteredOrders = orders.filter(order => order.date.startsWith(today));
            break;
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filteredOrders = orders.filter(order => new Date(order.date) >= weekAgo);
            break;
        case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            filteredOrders = orders.filter(order => new Date(order.date) >= monthAgo);
            break;
        default:
            filteredOrders = orders;
    }
    
    // Count products from filtered orders
    const productCounts = {};
    const productRevenue = {};
    
    filteredOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const productName = item.productName;
                const quantity = parseInt(item.quantity) || 1;
                const itemTotal = parseFloat(item.total) || 0;
                
                productCounts[productName] = (productCounts[productName] || 0) + quantity;
                productRevenue[productName] = (productRevenue[productName] || 0) + itemTotal;
            });
        }
    });
    
    // Sort by quantity sold
    const sortedProducts = Object.entries(productCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    if (sortedProducts.length === 0) {
        topProductsEl.innerHTML = `
            <div class="no-data">
                <i class="fas fa-chart-bar"></i>
                <p>Nenhum produto vendido no período</p>
                <small>Comece criando alguns pedidos</small>
            </div>
        `;
        return;
    }
    
    const maxCount = sortedProducts[0][1];
    
    topProductsEl.innerHTML = sortedProducts.map(([name, count], index) => {
        const percentage = (count / maxCount) * 100;
        const revenue = productRevenue[name] || 0;
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        
        return `
            <div class="product-item">
                <div class="product-rank">${index + 1}</div>
                <div class="product-info">
                    <span class="product-name">${medal} ${name}</span>
                    <div class="product-stats">
                        <span class="product-count">${count} vendidos</span>
                        <span class="product-revenue">R$ ${revenue.toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
                <div class="product-progress">
                    <div class="progress-bar" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function updateHourlyChart() {
    const chartEl = document.getElementById('hourly-chart');
    if (!chartEl) return;
    
    // Get today's orders and group by hour
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(order => order.date.startsWith(today));
    
    // Initialize hourly data for business hours (18h-23h)
    const hourlyData = {};
    for (let hour = 18; hour <= 23; hour++) {
        hourlyData[hour] = {
            hour: `${hour}h`,
            sales: 0,
            revenue: 0
        };
    }
    
    // Process today's orders
    todayOrders.forEach(order => {
        const orderDate = new Date(order.date);
        const hour = orderDate.getHours();
        
        // Only count orders during business hours
        if (hour >= 18 && hour <= 23) {
            hourlyData[hour].sales += 1;
            hourlyData[hour].revenue += parseFloat(order.total) || 0;
        }
    });
    
    // Convert to array and calculate max for percentage
    const chartData = Object.values(hourlyData);
    const maxSales = Math.max(...chartData.map(d => d.sales), 1); // Minimum 1 to avoid division by 0
    
    if (chartData.every(d => d.sales === 0)) {
        chartEl.innerHTML = `
            <div class="no-data">
                <i class="fas fa-clock"></i>
                <p>Nenhuma venda hoje</p>
                <small>As vendas aparecerão aqui conforme os pedidos são criados</small>
            </div>
        `;
        return;
    }
    
    chartEl.innerHTML = chartData.map(data => {
        const percentage = Math.max((data.sales / maxSales) * 100, 5); // Minimum 5% height for visibility
        return `
            <div class="chart-bar" style="height: ${percentage}%" 
                 title="${data.sales} vendas - R$ ${data.revenue.toFixed(2).replace('.', ',')}">
                <div class="bar-value">${data.sales}</div>
                <span class="hour">${data.hour}</span>
            </div>
        `;
    }).join('');
}

// Enhanced dashboard update function
function updateDashboard() {
    const today = new Date().toDateString();
    
    // Count totals
    document.getElementById('total-clients').textContent = clients.length;
    document.getElementById('total-products').textContent = products.length;
    
    // Count today's orders
    const todayOrders = orders.filter(order => 
        new Date(order.date).toDateString() === today
    );
    document.getElementById('orders-today').textContent = todayOrders.length;
    
    // Calculate today's sales
    const todaySales = todayOrders.reduce((sum, order) => 
        sum + parseFloat(order.total || 0), 0
    );
    document.getElementById('sales-today').textContent = 
        'R$ ' + todaySales.toFixed(2).replace('.', ',');
    
    // Update performance metrics
    updatePerformanceMetrics();
    
    // Update current time
    updateCurrentDate();
}

function updatePerformanceMetrics() {
    const metrics = document.querySelector('.performance-metrics');
    if (!metrics) return;
    
    // Calculate metrics
    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    const avgTicket = orders.length > 0 ? totalSales / orders.length : 0;
    const avgTime = 18; // Mock data
    const satisfaction = 4.8; // Mock data
    const dailyOrders = Math.ceil(orders.length / 7);
    
    metrics.innerHTML = `
        <div class="metric">
            <div class="metric-label">Ticket Médio</div>
            <div class="metric-value">R$ ${avgTicket.toFixed(2).replace('.', ',')}</div>
            <div class="metric-change positive">+5,2%</div>
        </div>
        <div class="metric">
            <div class="metric-label">Tempo Médio</div>
            <div class="metric-value">${avgTime} min</div>
            <div class="metric-change negative">+2 min</div>
        </div>
        <div class="metric">
            <div class="metric-label">Satisfação</div>
            <div class="metric-value">${satisfaction}★</div>
            <div class="metric-change positive">+0,2</div>
        </div>
        <div class="metric">
            <div class="metric-label">Pedidos/Dia</div>
            <div class="metric-value">${dailyOrders}</div>
            <div class="metric-change positive">+15%</div>
        </div>
    `;
}

// ===============================
// ENHANCED CLIENT FORM FUNCTIONS
// ===============================

function nextStep() {
    try {
        console.log('Next step called, current step:', currentStep);
        
        if (currentStep >= totalSteps) {
            console.log('Already at last step');
            showToast('Já está na última etapa', 'warning');
            return;
        }
        
        if (!validateCurrentStep()) {
            console.log('Validation failed for current step');
            return; // validateCurrentStep já mostra a mensagem de erro
        }
        
        // Add exit animation
        const currentStepElement = document.getElementById(`step-${currentStep}`);
        if (currentStepElement) {
            currentStepElement.classList.add('exiting');
        }
        
        setTimeout(() => {
            currentStep++;
            updateFormStep();
            console.log('Moved to step:', currentStep);
            
            // Remove exit animation
            document.querySelectorAll('.form-step').forEach(step => {
                step.classList.remove('exiting');
            });
            
            showToast(`Avançou para: ${getStepName(currentStep)}`, 'success');
        }, 300);
        
    } catch (error) {
        console.error('Error in nextStep:', error);
        showToast('Erro ao avançar etapa: ' + error.message, 'error');
    }
}

function previousStep() {
    try {
        console.log('Previous step called, current step:', currentStep);
        if (currentStep > 1) {
            // Add exit animation
            const currentStepElement = document.getElementById(`step-${currentStep}`);
            if (currentStepElement) {
                currentStepElement.classList.add('exiting');
            }
            
            setTimeout(() => {
                currentStep--;
                updateFormStep();
                console.log('Moved to step:', currentStep);
                
                // Remove exit animation
                document.querySelectorAll('.form-step').forEach(step => {
                    step.classList.remove('exiting');
                });
                
                showToast(`Voltou para: ${getStepName(currentStep)}`, 'success');
            }, 300);
        } else {
            console.log('Already at first step');
        }
    } catch (error) {
        console.error('Error in previousStep:', error);
        showToast('Erro ao voltar etapa', 'error');
    }
}

function updateFormStep() {
    try {
        console.log('Updating form step to:', currentStep);
        
        // Update step indicators
        const stepElements = document.querySelectorAll('.step');
        console.log('Found step elements:', stepElements.length);
        
        stepElements.forEach((step, index) => {
            step.classList.remove('active', 'completed', 'clickable');
            
            if (index + 1 < currentStep) {
                step.classList.add('completed', 'clickable');
            } else if (index + 1 === currentStep) {
                step.classList.add('active');
            }
            
            // Make completed steps clickable
            if (index + 1 < currentStep) {
                step.style.cursor = 'pointer';
                step.onclick = () => goToStep(index + 1);
            } else {
                step.style.cursor = 'default';
                step.onclick = null;
            }
        });
        
        // Update form content
        const formSteps = document.querySelectorAll('.form-step');
        console.log('Found form step elements:', formSteps.length);
        
        formSteps.forEach((step, index) => {
            step.classList.remove('active');
            if (index + 1 === currentStep) {
                step.classList.add('active');
                console.log('Activated step:', index + 1);
            }
        });
        
        // Update navigation buttons
        const prevBtn = document.querySelector('.btn-prev');
        const nextBtn = document.querySelector('.btn-next');
        const submitBtn = document.querySelector('.btn-submit');
        
        if (prevBtn) {
            prevBtn.style.display = currentStep === 1 ? 'none' : 'flex';
        } else {
            console.warn('Previous button not found');
        }
        
        if (nextBtn) {
            nextBtn.style.display = currentStep === totalSteps ? 'none' : 'flex';
        } else {
            console.warn('Next button not found');
        }
        
        if (submitBtn) {
            submitBtn.style.display = currentStep === totalSteps ? 'flex' : 'none';
        } else {
            console.warn('Submit button not found');
        }
        
        // Update progress
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill && progressText) {
            const percentage = (currentStep / totalSteps) * 100;
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `${Math.round(percentage)}% completo`;
        } else {
            console.warn('Progress elements not found');
        }
        
        // Update step counter
        const stepCounter = document.getElementById('current-step');
        if (stepCounter) {
            stepCounter.textContent = currentStep;
        } else {
            console.warn('Step counter element not found');
        }
        
        console.log('Form step update completed');
    } catch (error) {
        console.error('Error updating form step:', error);
        showToast('Erro ao atualizar formulário', 'error');
    }
}

function goToStep(targetStep) {
    try {
        console.log('Going to step:', targetStep);
        
        if (targetStep < 1 || targetStep > totalSteps) {
            console.warn('Invalid step number:', targetStep);
            return;
        }
        
        // Only allow going to completed steps or current step
        if (targetStep >= currentStep) {
            console.warn('Cannot go to future step:', targetStep);
            showToast('Complete a etapa atual antes de prosseguir', 'warning');
            return;
        }
        
        // Add exit animation to current step
        const currentStepElement = document.getElementById(`step-${currentStep}`);
        if (currentStepElement) {
            currentStepElement.classList.add('exiting');
            
            setTimeout(() => {
                currentStep = targetStep;
                updateFormStep();
                
                // Remove exit animation
                document.querySelectorAll('.form-step').forEach(step => {
                    step.classList.remove('exiting');
                });
            }, 300);
        } else {
            currentStep = targetStep;
            updateFormStep();
        }
        
        showToast(`Voltando para: ${getStepName(targetStep)}`, 'success');
        
    } catch (error) {
        console.error('Error going to step:', error);
        showToast('Erro ao navegar entre etapas', 'error');
    }
}

function getStepName(step) {
    const stepNames = {
        1: 'Dados Pessoais',
        2: 'Contato',
        3: 'Endereço'
    };
    return stepNames[step] || `Etapa ${step}`;
}

function validateCurrentStep() {
    try {
        console.log('Validating current step:', currentStep);
        
        const currentStepElement = document.getElementById(`step-${currentStep}`);
        
        if (!currentStepElement) {
            console.error('Step element not found:', `step-${currentStep}`);
            return false;
        }
        
        // Get only the truly required fields for each step
        let requiredFieldsForStep = [];
        
        switch (currentStep) {
            case 1: // Dados Pessoais - apenas ID e Nome são obrigatórios
                requiredFieldsForStep = ['client-id', 'client-name'];
                break;
            case 2: // Contato - apenas email e telefone são obrigatórios
                requiredFieldsForStep = ['client-email', 'client-phone'];
                break;
            case 3: // Endereço - apenas CEP, endereço e bairro são obrigatórios
                requiredFieldsForStep = ['client-cep', 'client-address', 'client-neighborhood'];
                break;
            default:
                console.log('Unknown step:', currentStep);
                return true; // Allow progression if step is unknown
        }
        
        console.log('Required fields for step', currentStep, ':', requiredFieldsForStep);
        
        let isValid = true;
        let firstInvalidField = null;
        
        requiredFieldsForStep.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                const value = field.value ? field.value.trim() : '';
                console.log(`Checking field ${fieldId}: "${value}"`);
                
                if (!value) {
                    isValid = false;
                    if (!firstInvalidField) {
                        firstInvalidField = field;
                    }
                    console.log('Field is empty:', fieldId);
                } else {
                    console.log('Field is valid:', fieldId);
                }
            } else {
                console.warn('Field not found:', fieldId);
            }
        });
        
        if (!isValid && firstInvalidField) {
            firstInvalidField.focus();
            showToast('Preencha todos os campos obrigatórios desta etapa', 'warning');
        }
        
        console.log('Step validation result:', isValid);
        return isValid;
        
    } catch (error) {
        console.error('Error in validateCurrentStep:', error);
        return false;
    }
}

function validateField(field) {
    try {
        if (!field) {
            console.error('Field is null or undefined');
            return false;
        }
        
        const value = field.value ? field.value.trim() : '';
        const fieldType = field.type || '';
        const fieldId = field.id || '';
        let isValid = true;
        let message = '';
        
        console.log(`Validating field ${fieldId}: "${value}"`);
        
        // Check if required field is empty
        if (field.required && !value) {
            isValid = false;
            message = 'Campo obrigatório';
    } else if (value) {
        // Specific validations
        switch (fieldId) {
            case 'client-id':
                if (!/^\d{3}$/.test(value)) {
                    isValid = false;
                    message = 'ID deve ter 3 dígitos';
                } else if (clients.some(c => c.id === value && c.id !== editingClient?.id)) {
                    isValid = false;
                    message = 'ID já existe';
                } else {
                    message = 'ID disponível';
                }
                break;
                
            case 'client-cpf':
                if (value && !validateCPF(value)) {
                    isValid = false;
                    message = 'CPF inválido';
                } else if (value) {
                    message = 'CPF válido';
                }
                break;
                
            case 'client-name':
                if (value.length < 3) {
                    isValid = false;
                    message = 'Nome muito curto';
                } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(value)) {
                    isValid = false;
                    message = 'Apenas letras e espaços';
                } else {
                    message = 'Nome válido';
                }
                break;
                
            case 'client-birth':
                const birthDate = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                
                if (age < 0 || age > 120) {
                    isValid = false;
                    message = 'Data inválida';
                } else if (age < 16) {
                    isValid = false;
                    message = 'Menor de 16 anos';
                } else {
                    message = `${age} anos`;
                }
                break;
                
            case 'client-email':
                if (!validateEmail(value)) {
                    isValid = false;
                    message = 'Email inválido';
                } else {
                    message = 'Email válido';
                }
                break;
                
            case 'client-phone':
                if (!validatePhone(value)) {
                    isValid = false;
                    message = 'Telefone inválido';
                } else {
                    message = 'Telefone válido';
                }
                break;
                
            case 'client-cep':
                if (!/^\d{5}-?\d{3}$/.test(value)) {
                    isValid = false;
                    message = 'CEP inválido';
                } else {
                    message = 'CEP válido';
                }
                break;
                
            default:
                if (value) {
                    message = 'Campo válido';
                }
        }
    }
    
        // Update field status
        updateFieldStatus(field, isValid, message);
        
        return isValid;
        
    } catch (error) {
        console.error('Error validating field:', fieldId, error);
        return false;
    }
}

function updateFieldStatus(field, isValid, message) {
    const fieldStatus = field.parentNode.querySelector('.field-status');
    if (!fieldStatus) return;
    
    fieldStatus.classList.remove('valid', 'invalid');
    fieldStatus.classList.add(isValid ? 'valid' : 'invalid');
    fieldStatus.classList.add('show');
    
    const messageSpan = fieldStatus.querySelector('.field-message');
    if (messageSpan) {
        messageSpan.textContent = message;
    }
    
    field.classList.remove('valid', 'invalid');
    if (field.value.trim()) {
        field.classList.add(isValid ? 'valid' : 'invalid');
    }
}

// Validation helper functions
function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^\(?[1-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Utility functions
function copyPhoneToWhatsApp() {
    const phone = document.getElementById('client-phone').value;
    const whatsapp = document.getElementById('client-whatsapp');
    
    if (phone) {
        whatsapp.value = phone;
        whatsapp.focus();
        showToast('Telefone copiado para WhatsApp!');
    } else {
        showToast('Preencha o telefone primeiro', 'error');
    }
}

async function searchCEP() {
    const cepInput = document.getElementById('client-cep');
    const cep = cepInput.value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        showToast('CEP deve ter 8 dígitos', 'error');
        return;
    }
    
    const searchBtn = document.querySelector('.btn-search-cep');
    const icon = document.getElementById('cep-icon');
    
    // Show loading
    searchBtn.classList.add('loading');
    icon.className = 'fas fa-spinner';
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (data.erro) {
            throw new Error('CEP não encontrado');
        }
        
        // Fill address fields
        const addressField = document.getElementById('client-address');
        const neighborhoodField = document.getElementById('client-neighborhood');
        
        if (addressField) addressField.value = data.logradouro || '';
        if (neighborhoodField) neighborhoodField.value = data.bairro || '';
        
        showToast('Endereço preenchido automaticamente!');
        
        // Validate filled fields
        ['client-address', 'client-neighborhood'].forEach(id => {
            const field = document.getElementById(id);
            if (field && field.value) {
                validateField(field);
            }
        });
        
    } catch (error) {
        showToast('Erro ao buscar CEP: ' + error.message, 'error');
    } finally {
        // Hide loading
        searchBtn.classList.remove('loading');
        icon.className = 'fas fa-search';
    }
}

// Format inputs on typing
function setupInputFormatting() {
    // CPF formatting
    const cpfInput = document.getElementById('client-cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });
    }
    
    // Phone formatting
    const phoneInputs = document.querySelectorAll('#client-phone, #client-whatsapp');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d{4})$/, '$1-$2');
            e.target.value = value;
        });
    });
    
    // CEP formatting
    const cepInput = document.getElementById('client-cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        });
    }
}

// Setup real-time validation
function setupRealTimeValidation() {
    const inputs = document.querySelectorAll('#client-form input, #client-form select');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() || this.required) {
                validateField(this);
            }
        });
        
        input.addEventListener('input', function() {
            // Clear previous validation state while typing
            const fieldStatus = this.parentNode.querySelector('.field-status');
            if (fieldStatus) {
                fieldStatus.classList.remove('show');
            }
            this.classList.remove('valid', 'invalid');
        });
    });
}

// ===============================
// ENHANCED PRODUCT FORM FUNCTIONS
// ===============================

function updateProductFields() {
    const productType = document.getElementById('product-type').value;
    const nameLabel = document.getElementById('product-name-label');
    const categorySpecific = document.getElementById('product-category-specific');
    const categorySpecificLabel = document.getElementById('category-specific-label');
    
    // Update name label based on category
    switch(productType) {
        case 'Pizza Tradicional':
        case 'Pizza Especial':
        case 'Pizza Doce':
            nameLabel.textContent = 'Sabor da Pizza';
            categorySpecificLabel.textContent = 'Massa';
            categorySpecific.innerHTML = `
                <option value="">Selecione</option>
                <option value="Tradicional">Tradicional</option>
                <option value="Integral">Integral</option>
                <option value="Sem Glúten">Sem Glúten</option>
                <option value="Fina">Fina</option>
                <option value="Pan">Pan</option>
            `;
            break;
        case 'Bebida':
            nameLabel.textContent = 'Nome da Bebida';
            categorySpecificLabel.textContent = 'Tipo';
            categorySpecific.innerHTML = `
                <option value="">Selecione</option>
                <option value="Refrigerante">Refrigerante</option>
                <option value="Suco Natural">Suco Natural</option>
                <option value="Suco Concentrado">Suco Concentrado</option>
                <option value="Água">Água</option>
                <option value="Cerveja">Cerveja</option>
                <option value="Energético">Energético</option>
                <option value="Chá">Chá</option>
                <option value="Café">Café</option>
            `;
            break;
        case 'Porções':
            nameLabel.textContent = 'Nome da Porção';
            categorySpecificLabel.textContent = 'Tipo';
            categorySpecific.innerHTML = `
                <option value="">Selecione</option>
                <option value="Frita">Frita</option>
                <option value="Assada">Assada</option>
                <option value="Grelhada">Grelhada</option>
                <option value="Salada">Salada</option>
                <option value="Carne">Carne</option>
                <option value="Frango">Frango</option>
                <option value="Peixe">Peixe</option>
            `;
            break;
        case 'Sobremesa':
            nameLabel.textContent = 'Nome da Sobremesa';
            categorySpecificLabel.textContent = 'Tipo';
            categorySpecific.innerHTML = `
                <option value="">Selecione</option>
                <option value="Gelada">Gelada</option>
                <option value="Quente">Quente</option>
                <option value="Doce Caseiro">Doce Caseiro</option>
                <option value="Sorvete">Sorvete</option>
                <option value="Torta">Torta</option>
                <option value="Pudim">Pudim</option>
            `;
            break;
        case 'Entrada':
            nameLabel.textContent = 'Nome da Entrada';
            categorySpecificLabel.textContent = 'Tipo';
            categorySpecific.innerHTML = `
                <option value="">Selecione</option>
                <option value="Fria">Fria</option>
                <option value="Quente">Quente</option>
                <option value="Pão">Pão</option>
                <option value="Antepasto">Antepasto</option>
            `;
            break;
        case 'Combo':
            nameLabel.textContent = 'Nome do Combo';
            categorySpecificLabel.textContent = 'Para quantas pessoas';
            categorySpecific.innerHTML = `
                <option value="">Selecione</option>
                <option value="1 pessoa">1 pessoa</option>
                <option value="2 pessoas">2 pessoas</option>
                <option value="3-4 pessoas">3-4 pessoas</option>
                <option value="5+ pessoas">5+ pessoas</option>
                <option value="Família">Família</option>
            `;
            break;
        default:
            nameLabel.textContent = 'Nome do Produto';
            categorySpecificLabel.textContent = 'Tipo Específico';
            categorySpecific.innerHTML = '<option value="">Selecione</option>';
    }
}

function toggleSizes() {
    const hasMultipleSizes = document.querySelector('input[name="has-sizes"]:checked').value === 'yes';
    const singlePriceSection = document.getElementById('single-price-section');
    const multipleSizesSection = document.getElementById('multiple-sizes-section');
    const mainPriceInput = document.getElementById('product-price');
    
    if (hasMultipleSizes) {
        singlePriceSection.style.display = 'none';
        multipleSizesSection.style.display = 'block';
        mainPriceInput.required = false;
        
        // Add initial size if none exists
        const sizesContainer = document.querySelector('.sizes-container');
        if (sizesContainer.children.length === 0) {
            addSizeOption();
        }
    } else {
        singlePriceSection.style.display = 'block';
        multipleSizesSection.style.display = 'none';
        mainPriceInput.required = true;
    }
}

function addSizeOption() {
    const sizesContainer = document.querySelector('.sizes-container');
    const sizeCount = sizesContainer.children.length;
    
    const sizeItem = document.createElement('div');
    sizeItem.className = 'size-item';
    sizeItem.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Tamanho</label>
                <input type="text" class="size-name" placeholder="Ex: Pequena, Média, Grande" required>
            </div>
            <div class="form-group">
                <label>Preço (R$)</label>
                <input type="number" class="size-price" step="0.01" min="0" placeholder="0,00" required>
            </div>
            <div class="form-group">
                <label>Descrição</label>
                <input type="text" class="size-description" placeholder="Ex: 25cm, 500ml">
            </div>
        </div>
        ${sizeCount > 0 ? '<button type="button" class="btn-remove-size" onclick="removeSizeOption(this)" title="Remover tamanho"><i class="fas fa-times"></i></button>' : ''}
    `;
    
    sizesContainer.appendChild(sizeItem);
}

function removeSizeOption(button) {
    const sizeItem = button.closest('.size-item');
    sizeItem.remove();
    
    // Ensure at least one size option exists
    const sizesContainer = document.querySelector('.sizes-container');
    if (sizesContainer.children.length === 0) {
        addSizeOption();
    }
}

function setupProductModal() {
    console.log('Setting up product modal...');
    
    // Reset form
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.reset();
        console.log('Product form reset successfully');
    } else {
        console.error('Product form not found in setupProductModal');
        return;
    }
    
    // Reset sections visibility
    const singlePriceSection = document.getElementById('single-price-section');
    const multipleSizesSection = document.getElementById('multiple-sizes-section');
    
    if (singlePriceSection) {
        singlePriceSection.style.display = 'block';
    }
    if (multipleSizesSection) {
        multipleSizesSection.style.display = 'none';
    }
    
    // Clear sizes container
    const sizesContainer = document.querySelector('.sizes-container');
    if (sizesContainer) {
        sizesContainer.innerHTML = '';
    }
    
    // Set defaults
    const availableElement = document.getElementById('product-available');
    const featuredElement = document.getElementById('product-featured');
    
    if (availableElement) availableElement.checked = true;
    if (featuredElement) featuredElement.checked = false;
    
    // Generate next product ID if not editing
    if (!editingProduct) {
        generateNextProductId();
    }
    
    // Update fields for default category
    updateProductFields();
    
    console.log('Product modal setup completed');
}

function generateNextProductId() {
    const idInput = document.getElementById('product-id');
    if (idInput && !editingProduct) {
        let nextId = 1;
        while (products.some(product => product.id === nextId.toString().padStart(3, '0'))) {
            nextId++;
        }
        idInput.value = nextId.toString().padStart(3, '0');
        console.log('Generated product ID:', idInput.value);
    }
}

function setupProductFormValidation() {
    const form = document.getElementById('product-form');
    const inputs = form.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateProductField(this);
        });
        
        input.addEventListener('input', function() {
            const fieldStatus = this.parentNode.querySelector('.field-status');
            if (fieldStatus) {
                fieldStatus.classList.remove('show', 'valid', 'invalid');
            }
            this.classList.remove('valid', 'invalid');
        });
    });
}

function validateProductField(field) {
    const fieldStatus = field.parentNode.querySelector('.field-status');
    if (!fieldStatus) return true;
    
    let isValid = true;
    let message = '';
    
    // Check if required field is empty
    if (field.required && !field.value.trim()) {
        isValid = false;
        message = 'Este campo é obrigatório';
    }
    // Validate product ID
    else if (field.id === 'product-id') {
        const id = field.value.trim();
        if (!/^\d{3}$/.test(id)) {
            isValid = false;
            message = 'ID deve ter 3 dígitos';
        } else if (!editingProduct && products.some(p => p.id === id)) {
            isValid = false;
            message = 'ID já existe';
        }
    }
    // Validate price
    else if (field.type === 'number' && field.value !== '') {
        const value = parseFloat(field.value);
        if (value < 0) {
            isValid = false;
            message = 'Valor deve ser positivo';
        } else if (value > 999) {
            isValid = false;
            message = 'Valor muito alto';
        }
    }
    
    // Apply validation styles
    field.classList.remove('valid', 'invalid');
    fieldStatus.classList.remove('show', 'valid', 'invalid');
    
    if (field.value.trim()) {
        fieldStatus.classList.add('show');
        if (isValid) {
            field.classList.add('valid');
            fieldStatus.classList.add('valid');
            fieldStatus.querySelector('.field-message').textContent = 'Válido';
        } else {
            field.classList.add('invalid');
            fieldStatus.classList.add('invalid');
            fieldStatus.querySelector('.field-message').textContent = message;
        }
    }
    
    return isValid;
}

// ===============================
// AUTHENTICATION & LOGOUT
// ===============================

function logout() {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
        logSecurityEvent('user_logout', {
            username: currentUser ? currentUser.username : 'unknown'
        });
        
        // Clear all session data
        localStorage.removeItem('loggedUser');
        localStorage.removeItem('rememberLogin');
        sessionStorage.clear();
        
        // Show logout message
        showToast('Logout realizado com sucesso!', 'success');
        
        // Redirect to login page after short delay
        setTimeout(() => {
            const currentPath = window.location.href;
            const loginPath = currentPath.replace('admin.html', 'index.html');
            window.location.href = loginPath;
        }, 1000);
    }
}

function updateUserDisplay() {
    if (currentUser) {
        const userNameElement = document.getElementById('current-user-name');
        const userRoleElement = document.getElementById('current-user-role');
        
        if (userNameElement) {
            userNameElement.textContent = currentUser.name || currentUser.username;
        }
        
        if (userRoleElement) {
            const roleDisplayMap = {
                'admin': 'Administrador',
                'manager': 'Gerente', 
                'staff': 'Atendente'
            };
            userRoleElement.textContent = roleDisplayMap[currentUser.role] || currentUser.role;
        }
    }
}