const toggleButton = document.getElementById('toggle-btn');
const editButton = document.getElementById('edit-options-btn');
const deleteButton = document.getElementById('delete-options-btn');
const editTaskButtons = document.querySelectorAll('.ditTask-btn');
const deleteTaskButtons = document.querySelectorAll('.deleteTask-btn');
const checkboxes = document.querySelectorAll('.checkbox');
const savetaskButton = document.getElementById('save-options-btn');
const sidebar = document.getElementById('sidebar');
const taskItem = document.querySelectorAll("#taskItem");
const colorThemes= document.querySelectorAll('[name="theme"]');

// Array que irá armazenar listas de tarefas.
let lists = []; 

// Objeto que irá conter as tarefas.
let tasks = {}; 

// Objeto que irá conter as notificações. 
let notifications = {};

// Variável para armazenar o emoji selecionado. 
let selectedEmoji = '';

document.addEventListener("DOMContentLoaded", () => {
    // Obtém os dados armazenados localmente para listas, tarefas e notificações.
    const storedLists = JSON.parse(localStorage.getItem('lists'));
    const storedTasks = JSON.parse(localStorage.getItem('tasks'));
    const storedNotifications = JSON.parse(localStorage.getItem('notifications'));

    const colorThemes = document.querySelectorAll('[name="theme"]');
    // Armazena e aplica o tema escolhido pelo usuário ao clicar em uma opção de tema.
    colorThemes.forEach(themeOption => {
        themeOption.addEventListener('click', () => storeTheme(themeOption.id));
    });

    // Inicializa listas, tarefas e notificações armazenadas, caso existam.
    if (storedLists) {
        lists = storedLists;
        updateSidebarList(); // Atualiza a sidebar, adicionando os links de redirecionamento para as listas salvas pelo usuário.
    }

    if (storedTasks) {
        tasks = storedTasks;
    }

    if (storedNotifications) {
        notifications = storedNotifications;
    }

    // Carrega as tarefas da lista atual, e configura o título e o emoji da lista para exibição na página.
    loadTasksForCurrentList();

    //Atualiza a interface, utilizando a porcentagem de tarefas concluidas para ajustar a posição e a aparência dos elementos animados.
    updateBoxAndTitle();

    // Configura a exibição e a posição de elementos da interface de acordo com o tema ativo e a porcentagem de conclusão de tarefas previamente salva.
    loadBoxAndTitlePosition();
    

    // Alterna a visibilidade do seletor de emoji quando o botão de emoji é clicado.
    document.getElementById('emoji-input-button').addEventListener('click', toggleEmojiPicker);

    // Para cada emoji disponível, adiciona um evento de clique para selecionar o emoji.
    document.querySelectorAll('.emoji').forEach(emoji => {
        emoji.addEventListener('click', function () {
            selectEmoji(emoji.textContent); // Define o emoji selecionado.
        });
    });

    // Adiciona uma lista ao enviar o formulário de lista 
    document.getElementById('form-list').addEventListener('submit', (e) => {
        e.preventDefault();
        addNewList();
    });

    // Adiciona tarefa ao enviar o formulário de tarefa
    document.getElementById('form-task').addEventListener('submit', (e) => {
        e.preventDefault();
        addTask();
    });

    // Adiciona um detector de clique no botão "add-task-btn-media" para exibir o formulário de tarefas nos dispositivos móveis
    document.querySelector('.add-task-btn-media').addEventListener('click', toggleAddTask);

    // Atualiza os botões de edição e deleção de tarefas
    updatetaskButtons();

    const params = new URLSearchParams(window.location.search);
    const listName = params.get('name');
    const notificationContainer = document.querySelector(".notifications");
    if (listName) {
        loadListControls(); // Carrega controles da lista.
        // Esconde as notificações das listas, com exceção da lista "Today"
        notificationContainer.style.display = "none"; 
    }

    // Recupera o tema armazenado e revela elementos que estão ocultos.
    retrieveTheme();
    revealHiddenElements();

});

// Função que armazena o tema selecionado pelo usuário no localStorage e, em seguida, recarrega a página para aplicar as mudanças
const storeTheme = function(theme) {
    // Armazena o tema fornecido no armazenamento local sob a chave "theme"
    localStorage.setItem("theme", theme);
    
    // Recarrega a página para aplicar as alterações de tema
    location.reload();
}

// Atualiza a sidebar, adicionando os links de redirecionamento para as listas salvas pelo usuário.
const updateSidebarList = () => {
    const sidebarList = document.getElementById("sidebar-list");

    // Limpa as listas existentes da sidebar, mantendo apenas as entradas "Today" e "Create List".
    sidebarList.innerHTML = `
    <li class="active">
        <a href="index.html">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#4F4F4F">
                <path d="M360-300q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/>
            </svg>
            <span id="today-sidebar">Today</span> <!-- Ícone e nome da seção 'Today' -->
        </a>
        <button onclick="toggleSidebar()" id="toggle-btn">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#4F4F4F"><path d="M440-240 200-480l240-240 56 56-183 184 183 184-56 56Zm264 0L464-480l240-240 56 56-183 184 183 184-56 56Z"/></svg>
        </button>
    </li>
    <li>
        <button onclick=toggleSubMenu(this) class="dropdown-btn">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
            <span id="create-list">Create List</span>
            <svg style="display: none;" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
        </button>
        <ul class="sub-menu">
            <div>
                <form id="form-list" action="">
                    <button type="button" id="emoji-input-button" onclick="toggleEmojiPicker()">📋</button>
                    <input id="listname-input" type="text" placeholder="Enter List name">
                    <button id="sidebar-add-list-btn" type="submit">+</button>
                </form>

                <div class="container-emoji" id="container-emoji" style="display: none;">
                    <div class="container-inside-emojis">
                        <span class="emoji">👤</span>
                        <span class="emoji">❤</span>
                        <span class="emoji">📝</span>
                        <span class="emoji">🛍</span>
                        <span class="emoji">⭐</span>
                        <span class="emoji">🐾</span>
                        <span class="emoji">🌱</span>
                        <span class="emoji">🥘</span>
                        <span class="emoji">🌍</span>
                        <span class="emoji">🏠</span>
                        <span class="emoji">🤷</span>
                        <span class="emoji">🎨</span>
                        <span class="emoji">🛫</span>
                        <span class="emoji">🏀</span>   
                        <span class="emoji">🛒</span>
                        <span class="emoji">🐕</span> 
                        <span class="emoji">😊</span>
                        <span class="emoji">👕</span>
                        <span class="emoji">👑</span>
                    </div>
                </div>
            </div>
        </ul>
    </li>
    `; 

    // Adiciona o link de redirecionamento de cada lista salva na sidebar.
    lists.forEach((list, index) => {
        const newListItem = document.createElement("li");
        const newAnchor = document.createElement("a");
        // Define o link para a página da lista.
        newAnchor.href = `list.html?name=${encodeURIComponent(list.name)}`;
        newAnchor.innerHTML = `
            <div class="emoji-sidebar">
                <span id="list-emoji-sidebar" >${list.emoji}</span>
            </div>
            <span id="list-name-sidebar">${list.name}</span> <!-- Mostra o emoji e nome da lista -->
        `;
        newListItem.appendChild(newAnchor);
        sidebarList.appendChild(newListItem);
    });
};

// Função que abre e fecha a sidebar
function toggleSidebar() {
    const toggleButton = document.getElementById('toggle-btn'); 
    sidebar.classList.toggle("close"); // Adiciona ou remove a classe "close" da sidebar, alternando seu estado

    toggleButton.classList.toggle("rotate"); // Adiciona ou remove a classe "rotate" do botão, para aplicar uma animação de rotação

    closeSubMenu(); // Fecha qualquer submenu aberto na sidebar

    // Para desktop
    if (window.innerWidth > 800) {
        const containerContent = document.querySelector(".main-container"); 
        const tasksDescriptionContent = document.querySelectorAll(".task-description"); 
        
        // Se a sidebar estiver fechada
        if (sidebar.classList.contains("close")) {
            containerContent.style.marginLeft = '30px'; 
            containerContent.style.width = 'calc(100% - 30px)'; 
            tasksDescriptionContent.forEach(taskDescriptionContent => {
                taskDescriptionContent.style.width = 'calc(100% + 700px)'; 
            });
        } else { // Se a sidebar estiver aberta
            containerContent.style.marginLeft = '200px'; 
            containerContent.style.width = 'calc(100% - 200px)'; 
            tasksDescriptionContent.forEach(taskDescriptionContent => {
                taskDescriptionContent.style.width = 'calc(100% + 500px)'; 
            });
        }
    }
};

// Função que abre e fecha o sub-menu (formulário de criação de uma nova lista)
function toggleSubMenu(button){
    if(!button.nextElementSibling.classList.contains('show')){
        closeSubMenu(); // Chama a função closeSubMenu para fechar qualquer submenu aberto
    }
    button.nextElementSibling.classList.toggle('show'); // Alterna a visibilidade do submenu associado ao botão

    // Se a sidebar estiver fechada, a abre
    if(sidebar.classList.contains('close')){
        sidebar.classList.toggle('close'); // Alterna a classe "close" da sidebar
        toggleButton.classList.toggle('rotate'); // Alterna a classe "rotate" do botão 
    }
};

// Fecha todos os submenus abertos na sidebar
function closeSubMenu(){
    Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
        ul.classList.remove('show'); // Remove a classe "show" de cada sub-menu aberto
        ul.previousElementSibling.classList.remove('show'); // Remove a classe "show" do botão que abre o sub-menu
    });
};

// Carrega as tarefas da lista atual, e configura o título e o emoji da lista para exibição na página.
function loadTasksForCurrentList() {

    // Obtém o nome da lista atual a partir dos parâmetros da URL.
    const params = new URLSearchParams(window.location.search);

    // Extrai o parâmetro 'name' da URL.
    const listName = params.get('name');
    
    // Busca a lista pelo nome entre as listas existentes.
    const list = lists.find(item => item.name === listName);

    // Define o título da lista na interface.
    document.getElementById("list-tittle").textContent = listName;

    // Se não houver um nome de lista nos parâmetros, define o título como 'Today'.
    if (!(listName)) {
        document.getElementById("list-tittle").textContent = 'Today';
    } else {
        // Se houver um nome de lista, define o emoji associado.
        document.getElementById("list-tittle-emoji").textContent = list.emoji;
    }

    // Atualiza a exibição das tarefas para a lista atual.
    updateTasksList(listName); 
};

// Atualiza a lista de tarefas exibida, organizando as tarefas da lista atual pelo prazo (deadline),
// e inclui as notificações de tarefas das demais listas com prazo para o dia atual, na lista "Today".
const updateTasksList = (listName) => {
    // Se listName for nulo, limpa a lista de notificações
    if (listName === null) {
        const notificationList = document.getElementById("notification-list");
        notificationList.innerHTML = ''; 
    }

    // Limpa a lista de tarefas 
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = ''; 

    // Função que ordena as tarefas pelo prazo (deadline)
    const sortTasksByDeadline = (tasksArray) => {
        return tasksArray.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    };

    if (!listName) {
        // Se listName não for especificado (ou seja, é a lista "Today")
        if (listName === null) {
            const notificationList = document.getElementById("notification-list");
            notificationList.innerHTML = ''; 
            
            lists.forEach((list) => {
                // Se listName for especificado (ou seja, não é a lista "Today")
                if (list.name !== null) {
                    const listTasks = tasks[list.name] || [];
                    listTasks.forEach((task, index) => {

                        // Verifica se o prazo da tarefa é o dia de hoje e se não foi concluída
                        if (isTaskDueToday(task.deadline) && task.completed === false) {
                            const listItem = createWarningListItem(task, index, listName, list.name); // Cria uma notificação
                            
                            // Exibe a notificação na lista de notificações, no caso do desktop
                            if (window.innerWidth > 800) {
                                notificationList.appendChild(listItem);
                            } else {
                                //Exibe a notificação na lista de tarefas, no caso de dispositivos móveis
                                taskList.appendChild(listItem);
                            }
                        }
                    });
                }
            });
        }
        
        // Obtém e ordena as tarefas de "Today" pelo prazo
        const todayTasks = tasks[null] || [];
        const sortedTasks = sortTasksByDeadline(todayTasks);

        // Adiciona as tarefas ordenadas à lista de tarefas
        sortedTasks.forEach((task, index) => {
            const listItem = createTaskListItem(task, index, listName, null);
            taskList.appendChild(listItem);
        });

    } else if (tasks[listName]) { // Para as outras listas, exibe e ordena as tarefas pelo prazo
        const sortedTasks = sortTasksByDeadline(tasks[listName]);

        // Adiciona as tarefas ordenadas à lista de tarefas
        sortedTasks.forEach((task, index) => {
            const listItem = createTaskListItem(task, index, listName, null);
            taskList.appendChild(listItem);
        });
    }

    // Para dispositivos móveis, inclui o botão de exclusão de cada tarefa
    if (window.innerWidth <= 800) {
        document.querySelectorAll('.taskItem').forEach((taskItem, index) => {
            const deleteButton = document.querySelectorAll(`.task-media-delete`)[index];
            showDeleteButton(taskItem, deleteButton); 
        });
    }
};

// Função que cria um item de lista que representa uma tarefa na lista.
const createTaskListItem = (task, index, listName, originList) => {

    // Cria um novo elemento de lista (li)
    const listItem = document.createElement("li");

    // Variáveis para definir as cores de fundo e texto, e a visibilidade da descrição da tarefa
    let backgroundColor;
    let backgroundColorMedia;
    let textColor;
    let textColorMedia;
    let hasDescription = task.description ? 'block' : 'none'; // Verifica se a tarefa tem descrição

    // Define as cores com base na prioridade da tarefa
    switch (task.priority) {
        case 'high':
            backgroundColor = 'var(--background-high)'; 
            backgroundColorMedia = '#FF9B9B'; 
            textColor = 'var(--text-high)'; 
            textColorMedia = '#B51E1E';
            break;
        case 'medium':
            backgroundColor = 'var(--background-medium)';
            backgroundColorMedia = '#FAFF9C'; 
            textColor = 'var(--text-medium)'; 
            textColorMedia = '#E8AA40';
            break;
        case 'low':
            backgroundColor = 'var(--background-low)'; 
            backgroundColorMedia = '#96FF9D'; 
            textColor = 'var(--text-low)'; 
            textColorMedia = '#1E8D25';
            break;
        default:
            backgroundColor = '#4F4F4F'; 
            backgroundColorMedia = '#DDDDDD'; 
            textColor = '#A5A5A5'; 
            textColorMedia = '#7F7E7E';
    }

    // Define o conteúdo HTML do item da lista
    listItem.innerHTML = `
        <div class="taskItem" style="background-color:${backgroundColor}; color:${textColor};">
            <div class="task-info">
                <p class="task-name">${task.text}</p> <!-- Nome da tarefa -->
                <p class="task-deadline">${task.deadline}</p> <!-- Prazo da tarefa -->
                <p style="display:${hasDescription}" class="task-description">${task.description}</p> <!-- Descrição da tarefa -->
            </div>
            <div class="task-extras"> 
                <div class="options">
                    <img style="display: none;" src="./img/edit.png" class="editTask-btn" data-index="${index}" onClick="editTask(${index})"/> <!-- Botão de editar -->
                    <img style="display: none;" src="./img/bin.png" class="deleteTask-btn" data-index="${index}" onClick="deleteTask(${index})"/> <!-- Botão de deletar -->
                    <input style="display: block;" type="checkbox" class="checkbox" data-index="${index}" ${task.completed ? 'checked' : ""} onchange="toggleTaskComplete(${index})"/> <!-- Checkbox para completar tarefa -->
                </div>
            </div>
        </div>
        <div class="task-media-delete" style="background-color:${backgroundColorMedia}; color:${textColorMedia}" onClick="deleteTask(${index})">
            <div class="add-task-backdrop-delete"></div>
            <div class="info-task-media-delete">
                <span>Delete Task</span> <!-- Texto para deletar a tarefa -->
            </div>
            <div class="icon-task-media-delete">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill=${textColorMedia}>
                    <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                </svg>
            </div>
        </div>
    `;

    // Retorna o elemento de lista criado
    return listItem;
};

// Função que criar um item de lista que representa uma notificação relacionada a uma tarefa.
const createWarningListItem = (task, index, listName, originList) => {

    // Declara variáveis para as cores de fundo e texto
    let backgroundColor;
    let textColor;
    let backgroundColorMedia;
    let textColorMedia;

    // Define as cores com base na prioridade da tarefa
    switch (task.priority) {
        case 'high':
            backgroundColor = 'var(--background-high)'; 
            backgroundColorMedia = '#FF9B99'; 
            textColor = 'var(--text-high)'; 
            textColorMedia = '#B51E1E';
            break;
        case 'medium':
            backgroundColor = 'var(--background-medium)';
            backgroundColorMedia = '#FAFF9C'; 
            textColor = 'var(--text-medium)'; 
            textColorMedia = '#E8AA40';
            break;
        case 'low':
            backgroundColor = 'var(--background-low)'; 
            backgroundColorMedia = '#96FF9D'; 
            textColor = 'var(--text-low)'; 
            textColorMedia = '#1E8D25';
            break;
        default:
            backgroundColor = '#4F4F4F'; 
            backgroundColorMedia = '#DDDDDD'; 
            textColor = '#A5A5A5'; 
            textColorMedia = '#7F7E7E';
    }

    // Cria um novo elemento de lista (li)
    const listItem = document.createElement("li");

    // Define o conteúdo HTML do item de notificação
    listItem.innerHTML = `
        <div class="notificationItem" style="background-color:${backgroundColor}; color:${textColor}" onclick="window.location.href='list.html?name=${originList}'">
            <div class="notification-info">
                <p class="notification-name">${originList}: ${task.text}</p> <!-- Nome da tarefa com o nome da lista -->
            </div>
            <div class="notification-deadline">
                <p class="notification-deadline">${task.deadline}</p> <!-- Prazo da tarefa -->
            </div>
        </div>
    `;

    // Retorna o elemento de lista criado
    return listItem;
};

// Função que alterna o status de conclusão de uma tarefa em uma determinada lista
const toggleTaskComplete = (index) => {
    const params = new URLSearchParams(window.location.search);
    // Extrai o nome da lista a partir dos parâmetros da URL
    const listName = params.get('name');
    
    // Inverte o estado de conclusão da tarefa no índice fornecido
    tasks[listName][index].completed = !tasks[listName][index].completed; 
    
    // Atualiza a lista de tarefas exibidas
    updateTasksList(listName); 
    // Salva as tarefas atualizadas no localStorage
    saveTasks(); 

    updateBoxAndTitle();
    updatetaskButtons();
};

// Função que verifica se uma determinada tarefa tem como prazo (deadline) o dia atual
const isTaskDueToday = (deadline) => {

    // Cria a data de hoje à meia-noite 
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Define as horas, minutos, segundos e milissegundos como 0

    const [year, month, day] = deadline.split('-').map(num => parseInt(num, 10));

    const deadlineDate = new Date(Date.UTC(year, month - 1, day)); 
    deadlineDate.setUTCHours(0, 0, 0, 0); 

    // Compara as duas datas
    const isSameDay = today.getTime() === deadlineDate.getTime(); 

    return isSameDay; // Retorna true se o prazo é hoje, caso contrário, retorna false
};

//Função de exibição do botão de exclusão, especifico de dispositivos móveis, quando o usuário mantém pressionado uma tarefa por um certo tempo. 
function showDeleteButton(taskItem, deleteButton) {
    
    // Função que torna o botão visível
    function onHold() {
        deleteButton.style.display = 'flex'; 
    }

    // Adiciona detectores de pressões longas com o mouse
    taskItem.addEventListener('mousedown', () => {
        holdTimer = setTimeout(onHold, 500); 
    });
    taskItem.addEventListener('mouseup', () => clearTimeout(holdTimer)); 
    taskItem.addEventListener('mouseleave', () => clearTimeout(holdTimer)); 

    // Adiciona ouvintes de eventos para detectar pressões longas com toque em dispositivos móveis
    taskItem.addEventListener('touchstart', () => {
        holdTimer = setTimeout(onHold, 500); 
    });
    taskItem.addEventListener('touchend', () => clearTimeout(holdTimer)); 
    taskItem.addEventListener('touchcancel', () => clearTimeout(holdTimer)); 

    // Esconde o botão de exclusão ao clicar em qualquer outro local do documento
    document.addEventListener('click', (event) => {
        if (!taskItem.contains(event.target) && !deleteButton.contains(event.target)) {
            deleteButton.style.display = 'none'; // Esconde o botão de exclusão
        }
    });
};

//Atualiza a interface, utilizando a porcentagem de tarefas concluidas para ajustar a posição e a aparência dos elementos animados.
const updateBoxAndTitle = () => {
    // Calcula a porcentagem de conclusão
    const percentage = calculateCompletionPercentage();

    const box = document.querySelector('.box');
    const finishLine = document.querySelector('.finish-line');
    const spaceship = document.querySelector('.spaceship');
    const gnome = document.querySelector('#metrognome');
    const mushroom = document.querySelector('.mushroom');
    const tube = document.querySelector('.tube');
    const crown = document.querySelector('.crown');
    const mouth = document.querySelector('.mouth-box');
    const h1Light = document.querySelector('.wrapper #light');
    const h1Dark = document.querySelector('.wrapper #dark');
    const h1Mario = document.querySelector('.wrapper #mario');
    const h1Princess = document.querySelector('.wrapper #princess');
    const lightPerspective = document.querySelector('.light-perspective');
    const person = document.querySelector('.person');

    // Obtém o tema ativo do localStorage
    const activeTheme = localStorage.getItem("theme");

    // Ajusta a exibição dos elementos com base no tema ativo
    switch (activeTheme) {
        case "light":
            // Exibe os elementos para o tema "light"
            box.style.display = 'block';
            finishLine.style.display = 'block';
            spaceship.style.display = 'none';
            gnome.style.display = 'none';
            mushroom.style.display = 'none';
            tube.style.display = 'none';
            crown.style.display = 'none';
            elementToMove = box; // Define o elemento que sera movido na animação
            h1Light.style.display = 'block'; 
            h1Dark.style.display = 'none';
            h1Mario.style.display = 'none';
            h1Princess.style.display = 'none';
            h1 = h1Light; // Define o título que sera exibido na animação
            break;
        case "garden":
            // Exibe os elementos para o tema do jardim
            box.style.display = 'none';
            finishLine.style.display = 'block';
            spaceship.style.display = 'none';
            gnome.style.display = 'block';
            mushroom.style.display = 'none';
            tube.style.display = 'none';
            crown.style.display = 'none';
            elementToMove = gnome; // Define o elemento que sera movido na animação
            h1Light.style.display = 'block';
            h1Dark.style.display = 'none';
            h1Mario.style.display = 'none';
            h1Princess.style.display = 'none';
            h1 = h1Light; // Define o título que sera exibido na animação
            break;
        case "mario":
            // Exibe os elementos para o tema Mario
            box.style.display = 'none';
            finishLine.style.display = 'none';
            spaceship.style.display = 'none';
            gnome.style.display = 'none';
            mushroom.style.display = 'block'; 
            tube.style.display = 'block'; 
            crown.style.display = 'none';
            elementToMove = mushroom; // Define o elemento que sera movido na animação
            h1Light.style.display = 'none';
            h1Dark.style.display = 'none';
            h1Mario.style.display = 'block'; 
            h1Princess.style.display = 'none';
            h1 = h1Mario; // Define o título que sera exibido na animação
            break;
        case "dark":
            // Exibe os elementos para o tema escuro
            box.style.display = 'none';
            finishLine.style.display = 'block';
            spaceship.style.display = 'block'; // Exibe a nave
            gnome.style.display = 'none';
            mushroom.style.display = 'none';
            tube.style.display = 'none';
            crown.style.display = 'none';
            elementToMove = spaceship; // Define o elemento que sera movido na animação
            h1Light.style.display = 'none';
            h1Dark.style.display = 'block'; // Exibe o título escuro
            h1Mario.style.display = 'none';
            h1Princess.style.display = 'none';
            h1 = h1Dark; // Define o título que sera exibido na animação
            break;
        case "princess":
            // Exibe os elementos para o tema da princesa
            box.style.display = 'none';
            finishLine.style.display = 'block';
            spaceship.style.display = 'none';
            gnome.style.display = 'none';
            mushroom.style.display = 'none';
            tube.style.display = 'none';
            crown.style.display = 'block'; 
            elementToMove = crown; // Define o elemento que sera movido na animação
            h1Light.style.display = 'none';
            h1Dark.style.display = 'none';
            h1Mario.style.display = 'none';
            h1Princess.style.display = 'block'; 
            h1 = h1Princess; // Define o título que sera exibido na animação
            break;
    }

    //Define a animação de movimento, no caso do desktop
    if (window.innerWidth > 800) {
        const totalMovement = h1.offsetWidth + elementToMove.offsetWidth; // Calcula a largura total a ser movida
        const boxMove = (totalMovement / 100) * percentage; // Calcula a movimentação baseada na porcentagem
        const rotation = percentage * (720 / 100); // Calcula a rotação (4 voltas)

        // Animação do movimento do elemento
        elementToMove.style.transition = 'transform 1s ease-in-out';
        elementToMove.style.transform = `translateY(-50%) translateX(${boxMove}px) rotate(${rotation}deg)`;

        // Animação do aparecimento do título
        h1.style.transition = 'clip-path 1s ease-in-out';
        h1.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;

    } else {
        // Comportamento para dispositivos móveis

        if (activeTheme === "mario") {
            // Move o cogumelo para baixo baseado na porcentagem
            const downMovement = (percentage / 100) * 40;
            mushroom.style.transition = 'transform 1s ease-in-out';
            mushroom.style.transform = `translateY(${downMovement}px)`;

        } else if (activeTheme === "dark") {
            // Ajusta a altura da luz com base na porcentagem
            const lightHeight = (percentage / 100) * 45; 
            lightPerspective.style.display = 'block';
            person.style.display = 'block';
            lightPerspective.querySelector('.light').style.height = `${lightHeight}px`; 

            // Mover a pessoa quando a porcentagem for 100
            if (percentage === 100) {
                person.style.transition = 'top 1s ease-in-out';
                person.style.top = '30px'; 
            } else {
                person.style.top = '70px'; 
            }

        } else if (activeTheme === "garden") {
            // Ajusta a cor do chapéu  baseado na porcentagem
            const hue = 133; 
            const saturation = Math.min(56, (percentage / 100) * 56); 
            const lightness = 34 + ((100 - percentage) * 0.2); 

            const hatColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            document.documentElement.style.setProperty('--color-hat-dynamic', hatColor);

        } else if (activeTheme === "princess") {
            // Mostra as joias na coroa a partir de determinadas porcentagens
            const stoneLeft = document.querySelector('#stone-left');
            const stoneCenter = document.querySelector('#stone-center');
            const stoneRight = document.querySelector('#stone-right');

            if (percentage >= 25) stoneLeft.style.opacity = '1'; 
            else stoneLeft.style.opacity = '0';

            if (percentage >= 50) stoneCenter.style.opacity = '1'; 
            else stoneCenter.style.opacity = '0';

            if (percentage >= 75) stoneRight.style.opacity = '1'; 
            else stoneRight.style.opacity = '0';

        } else {
            // Altera a expressão facial da box com base na porcentagem
            if (percentage > 75) {
                mouth.classList.add('smile'); // Adiciona sorriso
                mouth.classList.remove('sad', 'neutral'); 

            } else if (percentage >= 50 && percentage <= 75) {
                mouth.classList.add('neutral'); // Adiciona expressão neutra
                mouth.classList.remove('smile', 'sad');

            } else if (percentage >= 25 && percentage < 50) {
                mouth.classList.add('sad'); // Adiciona expressão triste
                mouth.classList.remove('smile', 'neutral');

            } else {
                mouth.classList.remove('smile', 'sad', 'neutral');
            }
        }
    }

    // Salva a porcentagem de tarefas concluidas
    saveCompletionPercentage();
};

// Função que calcula a porcentagem de tarefas concluídas em uma lista de tarefas específica
const calculateCompletionPercentage = () => {
    // Obtém os parâmetros da URL atual
    const params = new URLSearchParams(window.location.search);
    
    // Obtém o nome da lista de tarefas a partir do parâmetro 'name'
    const listName = params.get('name');
    
    // Verifica se a lista de tarefas existe e contém tarefas
    if (tasks[listName] && tasks[listName].length > 0) {
        const totalTasks = tasks[listName].length; // Total de tarefas na lista
        const completedTasks = tasks[listName].filter(task => task.completed).length; // Conta as tarefas concluídas
        
        // Calcula a porcentagem de tarefas concluídas
        const percentage = (completedTasks / totalTasks) * 100; 
        return percentage; 
    }
    
    // Se não houver tarefas, retorna 0
    return 0; 
};

// Função que armazena a porcentagem de tarefas concluídas no localStorage e, 
// se todas as tarefas estiverem concluídas, chama a função de animação do confete.
const saveCompletionPercentage = () => {
    // Obtém a porcentagem de conclusão das tarefas
    const percentage = calculateCompletionPercentage(); 
    
    // Armazena a porcentagem no localStorage
    localStorage.setItem('completionPercentage', percentage); 
    
    // Verifica se a porcentagem é 100%
    if(percentage === 100) {
        // Se a largura da janela for maior que 800 pixels, usa a animação de desktop
        if(window.innerWidth > 800) {
            setTimeout(() => {
                blastconfettiDesktop(); 
            }, 1200); 
        } else {
            // Se a largura da janela for menor ou igual a 800 pixels, usa a animação para dispositivos móveis
            setTimeout(() => {
                blastconfettiMedia(); 
            }, 1200); 
        }
    }
};

// Função da animação do confetti para desktop
blastconfettiDesktop = () => {
    const count = 200,
    defaults = {
    origin: { x:0.96, y: 0.1},
  };

function fire(particleRatio, opts) {
  confetti(
    Object.assign({}, defaults, opts, {
      particleCount: Math.floor(count * particleRatio),
    })
  );
}

fire(0.25, {
  spread: 26,
  startVelocity: 55,
});

fire(0.2, {
  spread: 60,
});

fire(0.35, {
  spread: 100,
  decay: 0.91,
  scalar: 0.8,
});

fire(0.1, {
  spread: 120,
  startVelocity: 25,
  decay: 0.92,
  scalar: 1.2,
});

fire(0.1, {
  spread: 120,
  startVelocity: 45,
});
};

// Função da animação do confetti para dispositivos móveis
blastconfettiMedia = () => {
    const count = 200,
    defaults = {
    origin: { x:0.74, y: 0.15},
  };

function fire(particleRatio, opts) {
  confetti(
    Object.assign({}, defaults, opts, {
      particleCount: Math.floor(count * particleRatio),
    })
  );
}

fire(0.25, {
  spread: 26,
  startVelocity: 55,
});

fire(0.2, {
  spread: 60,
});

fire(0.35, {
  spread: 100,
  decay: 0.91,
  scalar: 0.8,
});

fire(0.1, {
  spread: 120,
  startVelocity: 25,
  decay: 0.92,
  scalar: 1.2,
});

fire(0.1, {
  spread: 120,
  startVelocity: 45,
});
};

// Configura a exibição e a posição de elementos da interface de acordo com o tema ativo e a porcentagem de conclusão de tarefas previamente salva.
const loadBoxAndTitlePosition = () => {
    const box = document.querySelector('.wrapper .box');
    const finishLine = document.querySelector('.finish-line');
    const spaceship = document.querySelector('.spaceship');
    const gnome = document.querySelector('#metrognome');
    const mushroom = document.querySelector('.mushroom');
    const tube = document.querySelector('.tube');
    const crown = document.querySelector('.crown');
    const mouth = document.querySelector('.mouth');
    const h1Light = document.querySelector('.wrapper #light');
    const h1Dark = document.querySelector('.wrapper #dark');
    const h1Mario = document.querySelector('.wrapper #mario');
    const h1Princess = document.querySelector('.wrapper #princess');

    // Obtém o tema ativo do localStorage
    const activeTheme = localStorage.getItem("theme");

    // Define a exibição dos elementos com base no tema ativo
    switch (activeTheme) {
        case "light":
            box.style.display = 'block';
            finishLine.style.display = 'block';
            spaceship.style.display = 'none';
            gnome.style.display = 'none';
            mushroom.style.display = 'none';
            tube.style.display = 'none';
            crown.style.display = 'none';
            elementToMove = box; // Define o elemento a ser movido
            h1Light.style.display = 'block';
            h1Dark.style.display = 'none';
            h1Mario.style.display = 'none';
            h1Princess.style.display = 'none';
            h1 = h1Light; 
            break;
        case "garden":
            box.style.display = 'none';
            finishLine.style.display = 'block';
            spaceship.style.display = 'none';
            gnome.style.display = 'block';
            mushroom.style.display = 'none';
            tube.style.display = 'none';
            crown.style.display = 'none';
            elementToMove = gnome; // Define o gnome como elemento a ser movido
            h1Light.style.display = 'block';
            h1Dark.style.display = 'none';
            h1Mario.style.display = 'none';
            h1Princess.style.display = 'none';
            h1 = h1Light;
            break;
        case "mario":
            box.style.display = 'none';
            finishLine.style.display = 'none';
            spaceship.style.display = 'none';
            gnome.style.display = 'none';
            mushroom.style.display = 'block';
            tube.style.display = 'block';
            crown.style.display = 'none';
            elementToMove = mushroom; // Define o cogumelo como elemento a ser movido
            h1Light.style.display = 'none';
            h1Dark.style.display = 'none';
            h1Mario.style.display = 'block';
            h1Princess.style.display = 'none';
            h1 = h1Mario;
            break;
        case "dark":
            box.style.display = 'none';
            finishLine.style.display = 'block';
            spaceship.style.display = 'block';
            gnome.style.display = 'none';
            mushroom.style.display = 'none';
            tube.style.display = 'none';
            crown.style.display = 'none';
            elementToMove = spaceship; // Define a nave como elemento a ser movido
            h1Light.style.display = 'none';
            h1Dark.style.display = 'block';
            h1Mario.style.display = 'none';
            h1Princess.style.display = 'none';
            h1 = h1Dark;
            break;
        case "princess":
            box.style.display = 'none';
            finishLine.style.display = 'block';
            spaceship.style.display = 'none';
            gnome.style.display = 'none';
            mushroom.style.display = 'none';
            tube.style.display = 'none';
            crown.style.display = 'block';
            elementToMove = crown; // Define a coroa como elemento a ser movido
            h1Light.style.display = 'none';
            h1Dark.style.display = 'none';
            h1Mario.style.display = 'none';
            h1Princess.style.display = 'block';
            h1 = h1Princess;
            break;
    }

    // Se a largura da janela for maior que 800 pixels, ajusta a posição inicial
    if (window.innerWidth > 800) {
        window.addEventListener('load', () => {
            const savedPercentage = localStorage.getItem('completionPercentage') || 0; // Obtém a porcentagem salva

            // Calcula a posição e a rotação iniciais baseados na porcentagem salva
            const totalMovement = h1.offsetWidth + elementToMove.offsetWidth;
            const boxMove = (totalMovement / 100) * savedPercentage;
            const rotation = savedPercentage * (720 / 100);
            
            // Desativa as transições para a posição inicial
            elementToMove.style.transition = 'none';
            h1.style.transition = 'none';

            // Define a posição inicial baseada na porcentagem salva
            elementToMove.style.transform = `translateY(-50%) translateX(${boxMove}px) rotate(${rotation}deg)`;
            h1.style.clipPath = `polygon(0 0, ${savedPercentage}% 0, ${savedPercentage}% 100%, 0 100%)`;

            // Reativa as transições após 100ms
            setTimeout(() => {
                elementToMove.style.transition = 'transform 1s ease-in-out';
                h1.style.transition = 'clip-path 1s ease-in-out';
            }, 100);
        });
    }
};

// Função que alterna a visibilidade do menu de seleção dos temas nos dispositivos móveis (chamada pelo click no botão "theme-picker-btn")
function toggleThemePicker() {
    const themeMenu = document.getElementById('theme-sub-menu');
    themeMenu.classList.toggle('show');
};

// Função de exibição do seletor de emojis para criação de novas listas
function toggleEmojiPicker() {
    const emojiContainer = document.querySelector('.container-emoji');
    
    // Define o seletor de emojis visivel
    emojiContainer.style.display = 'block';

    // Adiciona um detector para o evento 'click' no documento para gerenciar cliques fora do seletor
    document.addEventListener('click', handleOutsideClick);
    
    // Seleciona todos os elementos com a classe 'emoji' e adiciona um detector de click
    document.querySelectorAll('.emoji').forEach(emoji => {
        emoji.addEventListener('click', function () {
            // Chama a função selectEmoji passando o emoji selecionado
            selectEmoji(emoji.textContent);
        });
    });
};

// Função que oculta o seletor de emojis quando o usuário clica fora dele
function handleOutsideClick(event) {
    const emojiContainer = document.querySelector('.container-emoji');
    const emojiButton = document.getElementById('emoji-input-button');

    // Verifica se o clique foi fora do contêiner de emojis e do botão
    if (!emojiContainer.contains(event.target) && event.target !== emojiButton) {
        emojiContainer.style.display = 'none';
        document.removeEventListener('click', handleOutsideClick); 
    }
};

// Função de seleção do emoji para a criação de uma lista
function selectEmoji(emoji) {
    const emojiContainer = document.querySelector('.container-emoji');

    // Armazena o emoji selecionado na variável 
    selectedEmoji = emoji;

    // Atualiza o botão do seletor de emoji para o emoji selecionado
    const emojiButton = document.getElementById('emoji-input-button');
    emojiButton.textContent = emoji; 

    // Oculta o seletor de emojis
    emojiContainer.style.display = 'none'; 

    document.removeEventListener('click', handleOutsideClick);
};

// Função que prmite que o usuário adicione novas listas ao sistema, realizando verificações para evitar duplicatas
function addNewList() {
    const listNameInput = document.getElementById("listname-input");
    const listName = listNameInput.value.trim(); 

    // Verifica se já existe uma lista com o mesmo nome (ignorando maiúsculas/minúsculas)
    const listExists = lists.some(list => list.name.toLowerCase() === listName.toLowerCase());

    if (listExists) {
        // Se a lista já existir, alerta o usuário para escolher um nome diferente
        alert("A list with this name already exists. Please choose a different name.");

    } else if (listName) {
        // Define um emoji padrão se nenhum emoji foi selecionado
        const emojiToUse = selectedEmoji || '📋'; 
        const fullListName = listName; 

        // Adiciona a nova lista ao array de listas, incluindo o emoji
        lists.push({ name: fullListName, emoji: emojiToUse }); 
        // Inicializa um array vazio de tarefas para a nova lista
        tasks[fullListName] = []; 
        // Salva a nova lista no localStorage
        saveLists(); 
        // Salva o objeto de tarefas no localStorage
        saveTasks(); 
        // Atualiza a lista na barra lateral
        updateSidebarList(); 
        // Limpa o campo de entrada
        listNameInput.value = ""; 
        // Reinicia o emoji selecionado
        selectedEmoji = ''; 
        // Define o texto do botão de emoji para o emoji padrão
        document.getElementById('emoji-input-button').textContent = '📋'; 
    } else {
        // Se o nome da lista não for válido, alerta o usuário
        alert("Please enter a valid list name.");
    }
};

// Função que exibe ou oculta o formulario de adição de tarefas nos dispositivos móveis
function toggleAddTask() {
    const addTaskBtn = document.querySelector('.add-task-btn-media');
    const addTaskMedia = document.querySelector('.add-task-media');
    
    // Adiciona um evento de clique no botão de adicionar tarefa que chama a função de adicionar tarefas
    document.getElementById('add-btn-media').addEventListener('click', addTask);

    // Adiciona um detector de click do botão "cancel-btn-media" para retirar a visualização do formulario de tarefas
    document.getElementById('cancel-btn-media').addEventListener('click', () => {
        document.querySelector('.add-task-media').classList.remove('active'); 
        document.querySelector('.add-task-btn-media').classList.remove('active'); 
    });

    addTaskBtn.classList.toggle('active'); 
    addTaskMedia.classList.toggle('active'); 
};

// Função que adiciona uma nova tarefa a uma determinada lista
const addTask = () => {
    // Obtém o nome da lista a partir da URL
    const params = new URLSearchParams(window.location.search);
    const listName = params.get('name'); 

    const taskInput = document.getElementById('input-task');
    const priorityInput = document.getElementById('priority');
    const deadlineInput = document.getElementById('deadline');
    const descriptionInput = document.getElementById('description');
    const taskInputMedia = document.getElementById('input-task-media');
    const priorityInputMedia = document.getElementById('priority-media');
    const deadlineInputMedia = document.getElementById('deadline-media');
    const descriptionInputMedia = document.getElementById('description-media');

    // Para desktop
    if(window.innerWidth > 800){
        const taskName = taskInput.value.trim();
        const priority = priorityInput.value;
        const deadline = deadlineInput.value;
        const description = descriptionInput.value;

        if (taskName) {
            tasks[listName].push({
                text: taskName,
                priority: priority,
                deadline: deadline,
                description: description,
                completed: false // Define a tarefa inicialmente como não concluída
            });
    
            // Limpa os campos de entrada após adicionar a tarefa
            taskInput.value = "";
            priorityInput.value = ""; 
            deadlineInput.value = "";
            descriptionInput.value = "";
            
            updateTasksList(listName); // Atualiza a lista de tarefas 
            updatetaskButtons(); // Atualiza os botões de edição e deleção da tarefa
            saveTasks(); // Salva as tarefas no armazenamento local
        } 
    }else{
        // Para dispositivos móveis
        const taskName = taskInputMedia.value.trim(); 
        const priority = priorityInputMedia.value;
        const deadline = deadlineInputMedia.value;
        const description = descriptionInputMedia.value;

        if (taskName) {
            tasks[listName].push({
                text: taskName,
                priority: priority,
                deadline: deadline,
                description: description,
                completed: false // Define a tarefa como não concluída
            });
    
            // Limpa os campos de entrada após adicionar a tarefa
            taskInputMedia.value = "";
            priorityInputMedia.value = ""; 
            deadlineInputMedia.value = "";
            descriptionInputMedia.value = "";
            
            updateTasksList(listName); // Atualiza a lista de tarefas 
            updatetaskButtons(); // Atualiza os botões da tarefa
            saveTasks(); // Salva as tarefas no armazenamento local
            document.querySelector('.add-task-btn-media').click(); // Fecha o formulário de adição
        } 
    }
};

// Função que deleta uma tarefa de uma determinada lista
const deleteTask = (index) => {
    const params = new URLSearchParams(window.location.search);
    const listName = params.get('name'); // Obtém o nome da lista a partir da URL
    
    // Remove a tarefa da lista pelo índice
    tasks[listName].splice(index, 1);

    // Salva as tarefas atualizadas no localStorage
    saveTasks();
    
    // Atualiza a exibição da lista de tarefas
    updateTasksList(listName);
    resetButtonsAfterOperation(); // Reseta botões após operação
    updatetaskButtons(); // Atualiza os botões de edição e deleção da tarefa
    updateBoxAndTitle(); 
};

// Restuara a interface de usuário para o estado padrão após uma operação de edição ou exclusão de tarefa
const resetButtonsAfterOperation = () => {
    // Oculta todos os botões de edição de tarefa
    editTaskButtons.forEach(button => {
        button.style.display = 'none'; 
    });

    // Mostra todos os checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.style.display = 'block';
    });

    // Oculta todos os botões de exclusão de tarefa
    deleteTaskButtons.forEach(button => {
        button.style.display = 'none';
    });

    // Oculta o botão de salvar tarefa
    savetaskButton.style.display = 'none'; 
    
    // Mostra os botões de editar e excluir principais
    editButton.style.display = 'block'; 
    deleteButton.style.display = 'block';
};

// Função que edita os dados de uma tarefa
const editTask = (index) => {
    editTaskButtons.forEach(button => {
        button.style.display = 'none'; 
    });
                
    checkboxes.forEach(checkbox => {
        checkbox.style.display = 'none'; 
    });
                
    deleteTaskButtons.forEach(button => {
        button.style.display = 'none'; 
    });
                
    savetaskButton.style.display = 'none'; 
    editButton.style.display = 'none'; 
    deleteButton.style.display = 'none'; 

    const params = new URLSearchParams(window.location.search);
    const listName = params.get('name');

    // Obtém a tarefa a ser editada
    const task = tasks[listName][index];

    if (!task) {
        console.error("Task not found"); 
        return;
    }

    deleteTask(index); // Remove a tarefa original da lista de exibição antes de editá-la

    const taskListItem = document.querySelector(`#form-task`);

    if (taskListItem) {

        // Limpa o formulário
        taskListItem.innerHTML = "";

        const firstLine = document.createElement("div");
        firstLine.classList.add("first-line-form");
        
        const taskInput = document.createElement("input");
        taskInput.type = "text";
        taskInput.value = task.text || ""; 
        taskInput.id = "input-task";
        taskInput.required = true; 
        taskInput.placeholder = "New task"; 
        firstLine.appendChild(taskInput);

        const newTaskButton = document.createElement("button");
        newTaskButton.id = "new-task-btn";
        newTaskButton.textContent = "+"; 
        firstLine.appendChild(newTaskButton);

        const secondLine = document.createElement("div");
        secondLine.classList.add("second-line-form");
        
        const prioritySelect = document.createElement("select");
        prioritySelect.id = "priority";

        const priorities = ["no", "low", "medium", "high"];
        
        priorities.forEach(priority => {
            const option = document.createElement("option");
            option.value = priority;
            option.textContent = priority === "no" ? "Priority" : priority; 
            if (task.priority === priority) {
                option.selected = true; // Seleciona a prioridade correspondente
            }
            prioritySelect.appendChild(option);
        });
        secondLine.appendChild(prioritySelect);

        const deadlineInput = document.createElement("input");
        deadlineInput.type = "text";
        deadlineInput.value = task.deadline || ""; 
        deadlineInput.id = "deadline";
        deadlineInput.required = true; 
        deadlineInput.placeholder = "Deadline"; 
        deadlineInput.onfocus = () => (deadlineInput.type = 'date'); 
        deadlineInput.onblur = () => {
            if (!deadlineInput.value) deadlineInput.type = 'text'; 
        };
        secondLine.appendChild(deadlineInput);

        const thirdLine = document.createElement("div");
        thirdLine.classList.add("third-line-form");
        
        const descriptionInput = document.createElement("input");
        descriptionInput.type = "text";
        descriptionInput.value = task.description || ""; 
        descriptionInput.id = "description";
        descriptionInput.placeholder = "Description"; 
        thirdLine.appendChild(descriptionInput);

        // Adiciona todas as linhas ao formulário
        taskListItem.appendChild(firstLine);
        taskListItem.appendChild(secondLine);
        taskListItem.appendChild(thirdLine);

        updateTasksList(listName);
    } 
};

// Função que gerencia a exibição dos botões de edição e exclusão, e checkboxes das tarefas
function updatetaskButtons() {
    // Seleciona os botões que acionam a edição e a exclusão de tarefas
    const editButton = document.getElementById('edit-options-btn');
    const deleteButton = document.getElementById('delete-options-btn');

    // Seleciona todos os botões de edição e exclusão de tarefas
    const editTaskButtons = document.querySelectorAll('.editTask-btn');
    const deleteTaskButtons = document.querySelectorAll('.deleteTask-btn');

    const checkboxes = document.querySelectorAll('.checkbox');

    // Adiciona um detector de clique do botão "edit-options-btn"
    document.getElementById('edit-options-btn').addEventListener('click', () => {
        // Mostra os botões de edição de todas as tarefa
        editTaskButtons.forEach(button => {
            button.style.display = 'block'; 
        });

        // Oculta todos os checkboxes
        checkboxes.forEach(checkbox => {
            checkbox.style.display = 'none';
        });

        // Oculta todos os botões de exclusão de todas as tarefa
        deleteTaskButtons.forEach(button => {
            button.style.display = 'none';
        });

        savetaskButton.style.display = 'block'; 
        editButton.style.display = 'none'; 
        deleteButton.style.display = 'none';
    });

    // Adiciona um detector de clique do botão "delete-options-btn"
    document.getElementById('delete-options-btn').addEventListener('click', () => {
        // Oculta todos os botões de edição de todas as tarefa
        editTaskButtons.forEach(button => {
            button.style.display = 'none'; 
        });

        // Oculta todos os checkboxes
        checkboxes.forEach(checkbox => {
            checkbox.style.display = 'none'; 
        });

        // Mostra todos os botões de exclusão de todas as tarefa
        deleteTaskButtons.forEach(button => {
            button.style.display = 'block'; 
        });

        savetaskButton.style.display = 'block'; 
        editButton.style.display = 'none'; 
        deleteButton.style.display = 'none';
    });

    // Adiciona um detector de clique do botão "save-options-btn"
    document.getElementById('save-options-btn').addEventListener('click', () => {
        // Oculta todos os botões de edição de todas as tarefa
        editTaskButtons.forEach(button => {
            button.style.display = 'none'; 
        });

        // Mostra todos os checkboxes
        checkboxes.forEach(checkbox => {
            checkbox.style.display = 'block'; 
        });

        // Oculta todos os botões de exclusão de todas as tarefa
        deleteTaskButtons.forEach(button => {
            button.style.display = 'none'; 
        });

        savetaskButton.style.display = 'none'; 
        editButton.style.display = 'block'; 
        deleteButton.style.display = 'block';
    });
};

// Função que salva o estado atual da lista de tarefas (tasks) no localStorage
const saveTasks = () => {
    // Armazena o objeto 'tasks' no localStorage 
    localStorage.setItem('tasks', JSON.stringify(tasks));
};

// Função que gerencia a edição e exclusão das listas
function loadListControls() {
    // Obtém os parâmetros da URL atual
    const params = new URLSearchParams(window.location.search);
    const listName = params.get('name'); 

    const listTitle = document.getElementById('list-tittle');
    const saveListButton = document.getElementById('save-list-btn');
    const deleteListButton = document.getElementById('delete-list-btn');
    const editButton = document.getElementById('edit-options-btn');
    const deleteButton = document.getElementById('delete-options-btn');


    if (listTitle) {
        // Para desktop
        if(window.innerWidth > 800) {
            // Adiciona um detector de duplo clique no título da lista
            listTitle.addEventListener('dblclick', () => {
                editListTitle(listTitle, listName, saveListButton, deleteListButton);
            });
        } else {
            // Para dispositivos móveis
            let holdTimer;

            // Função de pressionar
            function onHold() {
                editListTitle(listTitle, listName, saveListButton, deleteListButton);
            }

            listTitle.addEventListener('touchstart', () => {
                holdTimer = setTimeout(onHold, 500); // Aciona após 500ms
            });
            listTitle.addEventListener('touchend', () => clearTimeout(holdTimer));
            listTitle.addEventListener('touchcancel', () => clearTimeout(holdTimer));
        }
    }

    if (saveListButton && deleteListButton) {
        // Evento de salvar as alterações de uma lista
        saveListButton.addEventListener('click', () => {
            const newListName = document.getElementById('edit-list-input').value.trim();

            // Se o novo nome da lista não está vazio e é diferente do nome atual
            if (newListName && newListName !== listName) {
                const listIndex = lists.findIndex(list => list.name === listName);
                if (listIndex !== -1) {
                    lists[listIndex].name = newListName; // Atualiza o nome da lista no array (lists)
                    tasks[newListName] = tasks[listName]; // Move as tarefas para o novo nome da lista
                    delete tasks[listName]; 

                    saveLists(); // Salva as listas atualizadas
                    saveTasks(); // Salva as tarefas atualizadas

                    // Redireciona para a nova URL do nome da lista
                    window.location.href = `list.html?name=${encodeURIComponent(newListName)}`;
                }
            } else if (newListName === listName) {
                // Se o nome não mudou, apenas reseta a visualização
                revertToStaticListName(listName);
            }

            saveListButton.style.display = 'none'; 
            deleteListButton.style.display = 'none'; 
            editButton.style.display = 'block'; 
            deleteButton.style.display = 'block';
        });

        // Evento de deletar uma lista
        deleteListButton.addEventListener('click', () => {
            if (confirm("Are you sure you want to delete this list?")) {
                const listIndex = lists.findIndex(list => list.name === listName);
                if (listIndex !== -1) {
                    lists.splice(listIndex, 1); // Remove a lista do array

                    // Remove as tarefas da lista deletada
                    if (tasks[listName]) {
                        delete tasks[listName];
                    }

                    saveLists(); // Salva as listas atualizadas
                    saveTasks(); // Salva as tarefas atualizadas
                    window.location.href = "index.html"; // Redireciona para a página principal após a exclusão
                }
            }
        });
    }

    // Função para editar o título da lista
    function editListTitle(listTitleElement, currentListName, saveListButton, deleteListButton) {
        const listInput = document.createElement("input");
        listInput.type = "text";
        listInput.value = currentListName; 
        listInput.id = "edit-list-input";
        listInput.required = true;
        listInput.placeholder = "Enter a list name";
        listTitleElement.replaceWith(listInput); // Substitui o título da lista pelo campo de entrada

        saveListButton.style.display = 'block';
        deleteListButton.style.display = 'block';
        editButton.style.display = 'none'; 
        deleteButton.style.display = 'none';
    }

    // Função para reverter a entrada de volta ao título estático da lista após salvar
    function revertToStaticListName(updatedListName) {
        const newListTitle = document.createElement('span');
        newListTitle.id = 'list-tittle';
        newListTitle.textContent = updatedListName;

        const listInput = document.getElementById('edit-list-input');
        listInput.replaceWith(newListTitle); // Substitui o campo de entrada pelo título da lista

        saveListButton.style.display = 'none';
        deleteListButton.style.display = 'none';
        editButton.style.display = 'block'; 
        deleteButton.style.display = 'block';

        // Adiciona novamente os detectores novamente
        if(window.innerWidth > 800) {
            newListTitle.addEventListener('dblclick', () => {
                editListTitle(newListTitle, updatedListName, saveListButton, deleteListButton);
            });
        } else {
            let holdTimer;

            function onHold() {
                editListTitle(newListTitle, updatedListName, saveListButton, deleteListButton);
            }

            newListTitle.addEventListener('touchstart', () => {
                holdTimer = setTimeout(onHold, 500); 
            });
            newListTitle.addEventListener('touchend', () => clearTimeout(holdTimer));
            newListTitle.addEventListener('touchcancel', () => clearTimeout(holdTimer));
        }
    }
};

// Função que salva o estado atual da lista (lists) no localStorage
const saveLists = () => {
    // Salva a lista de listas no localStorage
    localStorage.setItem('lists', JSON.stringify(lists));
};

// Restaura o tema previamente selecionado e salvo no localStorage
const retrieveTheme = function() {
    // Obtém o tema ativo do localStorage
    const activeTheme = localStorage.getItem("theme");
    
    // Itera sobre cada opção de tema disponível
    colorThemes.forEach((themeOption) => {
        // Se o ID da opção de tema corresponder ao tema ativo, marca essa opção como selecionada
        if (themeOption.id === activeTheme) {
            themeOption.checked = true;
        }
        
        // Aplica o tema e revela os elementos relacionados ao tema
        applyThemeAndReveal();
    });
};

// Função que gerencia a troca de temas de maneira visualmente agradável
function applyThemeAndReveal() {

    // Temporariamente oculta os elementos antes da troca de tema
    document.querySelectorAll('.hidden-on-load').forEach(element => {

        // Adiciona a classe 'hidden-on-load' a cada elemento encontrado
        element.classList.add('hidden-on-load');
        
        // Define a opacidade do elemento para 0, tornando-o invisível
        element.style.opacity = '0';
    });

    // Atualiza os elementos da pagina
    updateBoxAndTitle();

    setTimeout(() => {
        revealHiddenElements(); // Chama a função para revelar os elementos ocultos
    }, 200); // Um leve atraso para garantir que todas as alterações de tema sejam aplicadas
};

// Função de exibição dos elementos que estavam ocultos ao carregar a página
function revealHiddenElements() {
    // Seleciona todos os elementos que têm a classe 'hidden-on-load'
    document.querySelectorAll('.hidden-on-load').forEach(element => {
        // Remove a classe 'hidden-on-load' de cada elemento encontrado
        element.classList.remove('hidden-on-load');
        
        // Define a opacidade do elemento para 1, tornando-o totalmente visível
        element.style.opacity = '1';
    });
};

// Função que armazena as notificações no LocalStorage
const saveNotifications = () => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
};

window.onclick = function(event) {
    // Verifica se o alvo do clique não corresponde ao botão do seletor de tema
    if (!event.target.matches('#theme-picker-btn')) {
        // Seleciona o menu de temas
        const themeMenu = document.getElementById('theme-sub-menu');
        // Verifica se o menu de temas está aberto
        if (themeMenu.classList.contains('show')) {
            // Se estiver aberto, remove a classe 'show' para fechá-lo
            themeMenu.classList.remove('show'); 
        }
    }
}