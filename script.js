// Données initiales
const expectedPassword = "motdepasse-securise"; // À changer en production

function checkAuth() {
  const storedAuth = localStorage.getItem('lab-auth');
  if (!storedAuth || storedAuth !== expectedPassword) {
    const password = prompt("Entrez le mot de passe du laboratoire:");
    if (password !== expectedPassword) {
      alert("Accès refusé");
      window.location.href = "about:blank";
      return false;
    }
    localStorage.setItem('lab-auth', password);
  }
  return true;
}

if (!checkAuth()) {
  // Bloquer l'accès si non authentifié
  document.body.innerHTML = "<h1>Accès non autorisé</h1>";
  throw new Error("Authentification requise");
let currentUser = {
    id: 'tech123',
    name: 'Technicien de Garde',
    role: 'technicien'
};

let labStatus = {
    status: 'ouvert',
    message: 'Toutes les analyses sont disponibles selon les délais standards.',
    lastUpdated: new Date()
};

let exams = [
    { id: '1', code: 'NFS', name: 'Numération Formule Sanguine', available: 'oui', delay: 24, notes: '' },
    { id: '2', code: 'GLY', name: 'Glycémie', available: 'oui', delay: 6, notes: '' },
    { id: '3', code: 'CREAT', name: 'Créatinine', available: 'oui', delay: 24, notes: '' },
    { id: '4', code: 'PCR', name: 'Protéine C Réactive', available: 'limite', delay: 48, notes: 'Matériel limité' },
    { id: '5', code: 'TP', name: 'Temps de Prothrombine', available: 'non', delay: 72, notes: 'En panne jusqu\'à demain' }
];

let notifications = [
    { id: '1', message: 'Les analyses de PCR sont limitées aujourd\'hui en raison d\'un problème d\'approvisionnement.', timestamp: new Date('2023-05-01T10:30:00'), sender: 'tech123' },
    { id: '2', message: 'Le TP sera à nouveau disponible demain matin.', timestamp: new Date('2023-05-02T14:15:00'), sender: 'tech123' }
];

// DOM Elements
const currentUserSpan = document.getElementById('current-user');
const currentTimeSpan = document.getElementById('current-time');
const logoutBtn = document.getElementById('logout');
const labStatusSelect = document.getElementById('lab-status');
const updateStatusBtn = document.getElementById('update-status');
const lastUpdateSpan = document.getElementById('last-update');
const statusMessageP = document.getElementById('status-message');
const examsTable = document.querySelector('#exams-table tbody');
const examSearch = document.getElementById('exam-search');
const addExamBtn = document.getElementById('add-exam');
const notificationText = document.getElementById('notification-text');
const sendNotificationBtn = document.getElementById('send-notification');
const notificationList = document.getElementById('notification-list');
const examModal = document.getElementById('exam-modal');
const closeModal = document.querySelector('.close');
const examForm = document.getElementById('exam-form');

// Initialisation
function init() {
    // Afficher l'utilisateur actuel
    currentUserSpan.textContent = `Technicien: ${currentUser.name}`;
    
    // Mettre à jour l'heure en temps réel
    updateTime();
    setInterval(updateTime, 60000);
    
    // Charger le statut du labo
    loadLabStatus();
    
    // Charger la liste des analyses
    loadExams();
    
    // Charger les notifications
    loadNotifications();
    
    // Événements
    logoutBtn.addEventListener('click', logout);
    updateStatusBtn.addEventListener('click', updateLabStatus);
    addExamBtn.addEventListener('click', openAddExamModal);
    closeModal.addEventListener('click', closeModalFunc);
    window.addEventListener('click', outsideClick);
    examForm.addEventListener('submit', saveExam);
    examSearch.addEventListener('input', filterExams);
    sendNotificationBtn.addEventListener('click', sendNotification);
}

function updateTime() {
    const now = new Date();
    currentTimeSpan.textContent = now.toLocaleString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function loadLabStatus() {
    labStatusSelect.value = labStatus.status;
    lastUpdateSpan.textContent = labStatus.lastUpdated.toLocaleString('fr-FR');
    statusMessageP.textContent = labStatus.message;
}

function updateLabStatus() {
    const newStatus = labStatusSelect.value;
    let message = '';
    
    switch(newStatus) {
        case 'ouvert':
            message = 'Toutes les analyses sont disponibles selon les délais standards.';
            break;
        case 'reduit':
            message = 'Service réduit - Certaines analyses peuvent avoir des délais prolongés.';
            break;
        case 'urgence':
            message = 'Urgences seulement - Seules les analyses critiques sont disponibles.';
            break;
        case 'ferme':
            message = 'Laboratoire fermé - Aucune analyse disponible jusqu\'à la réouverture.';
            break;
    }
    
    labStatus = {
        status: newStatus,
        message: message,
        lastUpdated: new Date()
    };
    
    // Enregistrer dans localStorage ou envoyer au serveur
    localStorage.setItem('labStatus', JSON.stringify(labStatus));
    
    // Mettre à jour l'affichage
    loadLabStatus();
    
    // Ajouter une notification automatique
    const notification = {
        id: Date.now().toString(),
        message: `Changement de statut du laboratoire: ${message}`,
        timestamp: new Date(),
        sender: currentUser.id
    };
    notifications.unshift(notification);
    loadNotifications();
}

function loadExams(filter = '') {
    examsTable.innerHTML = '';
    
    const filteredExams = exams.filter(exam => 
        exam.code.toLowerCase().includes(filter.toLowerCase()) || 
        exam.name.toLowerCase().includes(filter.toLowerCase())
    );
    
    filteredExams.forEach(exam => {
        const row = document.createElement('tr');
        
        let availableClass = '';
        let availableText = '';
        
        switch(exam.available) {
            case 'oui':
                availableClass = 'available-yes';
                availableText = 'Disponible';
                break;
            case 'non':
                availableClass = 'available-no';
                availableText = 'Indisponible';
                break;
            case 'limite':
                availableClass = 'available-limited';
                availableText = 'Limité';
                break;
        }
        
        row.innerHTML = `
            <td>${exam.code}</td>
            <td>${exam.name}</td>
            <td class="${availableClass}">${availableText}</td>
            <td>${exam.delay} h</td>
            <td>
                <button class="action-btn edit-btn" data-id="${exam.id}">Modifier</button>
                <button class="action-btn delete-btn" data-id="${exam.id}">Supprimer</button>
            </td>
        `;
        
        examsTable.appendChild(row);
    });
    
    // Ajouter les événements aux boutons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const examId = e.target.getAttribute('data-id');
            editExam(examId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const examId = e.target.getAttribute('data-id');
            deleteExam(examId);
        });
    });
}

function filterExams() {
    loadExams(examSearch.value);
}

function openAddExamModal() {
    document.getElementById('exam-id').value = '';
    document.getElementById('exam-code').value = '';
    document.getElementById('exam-name').value = '';
    document.getElementById('exam-available').value = 'oui';
    document.getElementById('exam-delay').value = '24';
    document.getElementById('exam-notes').value = '';
    
    examModal.style.display = 'block';
}

function editExam(id) {
    const exam = exams.find(e => e.id === id);
    if (!exam) return;
    
    document.getElementById('exam-id').value = exam.id;
    document.getElementById('exam-code').value = exam.code;
    document.getElementById('exam-name').value = exam.name;
    document.getElementById('exam-available').value = exam.available;
    document.getElementById('exam-delay').value = exam.delay;
    document.getElementById('exam-notes').value = exam.notes;
    
    examModal.style.display = 'block';
}

function closeModalFunc() {
    examModal.style.display = 'none';
}

function outsideClick(e) {
    if (e.target === examModal) {
        examModal.style.display = 'none';
    }
}

function saveExam(e) {
    e.preventDefault();
    
    const id = document.getElementById('exam-id').value;
    const code = document.getElementById('exam-code').value;
    const name = document.getElementById('exam-name').value;
    const available = document.getElementById('exam-available').value;
    const delay = document.getElementById('exam-delay').value;
    const notes = document.getElementById('exam-notes').value;
    
    if (!code || !name || !delay) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    if (id) {
        // Modification
        const index = exams.findIndex(e => e.id === id);
        if (index !== -1) {
            exams[index] = { id, code, name, available, delay: parseInt(delay), notes };
        }
    } else {
        // Nouvelle analyse
        const newExam = {
            id: Date.now().toString(),
            code,
            name,
            available,
            delay: parseInt(delay),
            notes
        };
        exams.unshift(newExam);
    }
    
    // Enregistrer dans localStorage ou envoyer au serveur
    localStorage.setItem('exams', JSON.stringify(exams));
    
    // Recharger la liste
    loadExams(examSearch.value);
    
    // Fermer le modal
    closeModalFunc();
}

function deleteExam(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette analyse?')) return;
    
    exams = exams.filter(e => e.id !== id);
    
    // Enregistrer dans localStorage ou envoyer au serveur
    localStorage.setItem('exams', JSON.stringify(exams));
    
    // Recharger la liste
    loadExams(examSearch.value);
}

function loadNotifications() {
    notificationList.innerHTML = '';
    
    notifications.forEach(notif => {
        const li = document.createElement('li');
        const date = new Date(notif.timestamp);
        
        li.innerHTML = `
            <strong>${date.toLocaleString('fr-FR')}</strong>
            <p>${notif.message}</p>
        `;
        
        notificationList.appendChild(li);
    });
}

function sendNotification() {
    const message = notificationText.value.trim();
    
    if (!message) {
        alert('Veuillez entrer un message');
        return;
    }
    
    const notification = {
        id: Date.now().toString(),
        message: message,
        timestamp: new Date(),
        sender: currentUser.id
    };
    
    notifications.unshift(notification);
    
    // Enregistrer dans localStorage ou envoyer au serveur
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Recharger la liste
    loadNotifications();
    
    // Effacer le champ de texte
    notificationText.value = '';
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
        // Rediriger vers la page de connexion
        window.location.href = 'login.html';
    }
}

// Charger les données sauvegardées si elles existent
function loadSavedData() {
    const savedLabStatus = localStorage.getItem('labStatus');
    if (savedLabStatus) {
        labStatus = JSON.parse(savedLabStatus);
        labStatus.lastUpdated = new Date(labStatus.lastUpdated);
    }
    
    const savedExams = localStorage.getItem('exams');
    if (savedExams) {
        exams = JSON.parse(savedExams);
    }
    
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
        notifications = JSON.parse(savedNotifications);
        notifications.forEach(n => n.timestamp = new Date(n.timestamp));
    }
}

// Initialiser l'application
loadSavedData();
init();
setInterval(() => {
  localStorage.setItem('exams-backup', JSON.stringify(exams));
  localStorage.setItem('notifications-backup', JSON.stringify(notifications));
  console.log("Sauvegarde automatique effectuée");
}, 60000); // Toutes les minutes