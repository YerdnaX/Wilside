import { GoogleGenAI } from "@google/genai";

// Array de TODOs
const tasks = [];

// Tests
tasks.push({ description: "limpiar casa", time:120 });
tasks.push({ description: "lavar carro", time:60 });
tasks.push({ description: "cocinar almuerzo", time:30 });
renderTasks();

// Inicializa el SDK de google para usar Gemini
const ai = new GoogleGenAI({ apiKey: "AIzaSyByE4u_aw6SoLGmLNkVR2svYM_r2tmLJO0" });

// Inicializa los elementos del DOM
document.getElementById("add-task-btn").addEventListener("click", function() {
    addTask()
});

document.getElementById("optimize-btn").addEventListener("click", async function() {
    await optimize()
});

setLoading(false);

// Funciones
function addTask() {
  const descInput = document.getElementById('description');
  const timeInput = document.getElementById('time');
  const description = descInput.value.trim();
  const time = parseInt(timeInput.value);

  if (description && !isNaN(time)) {
    // Agrega TODO a la lista
    tasks.push({ description, time });
    // Limpia los fields de la pantalla
    descInput.value = '';
    timeInput.value = '';
    // Hace reload de la lista de tareas
    renderTasks();
  }
}

function renderTasks() {
    cleanRecommendations();

    const taskList = document.getElementById('taskList');
    // Limpia el element de tasklist
    taskList.innerHTML = '';
    // Por cada todo crea un elemento y lo agrega al DOM
    tasks.forEach((task, i) => {
        const li = document.createElement('li');
        li.className = 'task-item';

        const span = document.createElement('span');
        span.textContent = `${task.description} - ${task.time} min`;

        const deleteBtnIcon = document.createElement('i');
        deleteBtnIcon.className = "fa fa-solid fa-trash";

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.ariaLabel = "Borrar Tarea"
        deleteBtn.appendChild(deleteBtnIcon)

        deleteBtn.onclick = () => {  
            const confirmDelete = confirm("Estas seguro que deseas eliminar esta tarea?");
            if (confirmDelete === false) {
                return;
            }

            tasks.splice(i, 1);
            renderTasks();
        };

        li.appendChild(span);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

function cleanRecommendations() {
    document.getElementById('recommendation').textContent = "Agrega tareas para tener recomendaciones";
}

function setLoading(isLoading) {
    document.getElementById('optimize-btn').disabled = isLoading;
    document.getElementById('optimize-loading-i').style.display = isLoading ? "" : "none";
}

async function optimize() {
    setLoading(true);
    // Crea prompt para AI
    var prompt = [
        "Optimize la siguiente lista de TODOs del usuario"
    ]
    tasks.forEach((element, index) => {
        prompt.push(`${element.description}.Toma ${element.time}min.`)
    })
    console.log(prompt.join(','));
    // Hace un request para generar el contenido
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt.join(","),
        config: {
            systemInstruction: "Eres un desarrollador de software. Tu nombre es Neko. Necesitas input de tipo markdown de Gemini (no necesitas que se mencione esto)",
        },
    }).catch((error) => {
        console.log(error)
    });

    setLoading(false);

    if (response != undefined) {
        // Actualiza el campo de recomendacion con el response
        var converter = new showdown.Converter();
        let html = converter.makeHtml(response.text);
        console.log(response.text)
        document.getElementById('recommendation').innerHTML = html
    }
}