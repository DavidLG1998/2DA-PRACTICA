document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const inputScreen = document.getElementById("input-screen")
  const resultsScreen = document.getElementById("results-screen")
  const participantsTextarea = document.getElementById("participants")
  const counter = document.querySelector(".counter")
  const titleInput = document.getElementById("title")
  const teamCountSelect = document.getElementById("team-count")
  const membersCountSelect = document.getElementById("members-count")
  const teamsSelector = document.getElementById("teams-selector")
  const membersSelector = document.getElementById("members-selector")
  const generateBtn = document.getElementById("generate-btn")
  const clearBtn = document.getElementById("clear-btn")
  const downloadBtn = document.getElementById("download-btn")
  const copyBtn = document.getElementById("copy-btn")
  const copyColumnsBtn = document.getElementById("copy-columns-btn")
  const backBtn = document.getElementById("back-btn")
  const resultsTitle = document.getElementById("results-title")
  const teamsGrid = document.getElementById("teams-grid")
  const resultsContainer = document.getElementById("results-container")

  // Variables globales
  let generatedTeams = []
  const html2canvas = window.html2canvas // Declare the html2canvas variable

  // Inicializar selectores
  initializeSelectors()

  // Event listeners
  participantsTextarea.addEventListener("input", updateCounter)
  document.querySelectorAll('input[name="distribution"]').forEach((radio) => {
    radio.addEventListener("change", toggleDistributionType)
  })

  clearBtn.addEventListener("click", clearForm)
  generateBtn.addEventListener("click", generateTeams)
  downloadBtn.addEventListener("click", downloadAsImage)
  copyBtn.addEventListener("click", copyToClipboard)
  copyColumnsBtn.addEventListener("click", copyColumnsToClipboard)
  backBtn.addEventListener("click", goBack)

  // Funciones
  function initializeSelectors() {
    // Generar opciones para cantidad de equipos (2-20)
    for (let i = 2; i <= 20; i++) {
      const option = document.createElement("option")
      option.value = i
      option.textContent = `${i} equipos`
      teamCountSelect.appendChild(option)
    }

    // Generar opciones para participantes por equipo (2-20)
    for (let i = 2; i <= 20; i++) {
      const option = document.createElement("option")
      option.value = i
      option.textContent = `${i} participantes`
      membersCountSelect.appendChild(option)
    }
  }

  function updateCounter() {
    const lines = participantsTextarea.value.split("\n").filter((line) => line.trim() !== "")
    counter.textContent = lines.length

    // Limitar a 100 participantes
    if (lines.length > 100) {
      const limitedLines = lines.slice(0, 100)
      participantsTextarea.value = limitedLines.join("\n")
      counter.textContent = limitedLines.length
    }
  }

  function toggleDistributionType(e) {
    if (e.target.value === "teams") {
      teamsSelector.style.display = "flex"
      membersSelector.style.display = "none"
    } else {
      teamsSelector.style.display = "none"
      membersSelector.style.display = "flex"
    }
  }

  function clearForm() {
    participantsTextarea.value = ""
    titleInput.value = ""
    updateCounter()
  }

  function generateTeams() {
    // Obtener lista de participantes
    const participantList = participantsTextarea.value
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p !== "")

    if (participantList.length === 0) {
      alert("Por favor ingrese al menos un participante")
      return
    }

    // Mezclar participantes aleatoriamente
    const shuffled = [...participantList].sort(() => Math.random() - 0.5)

    // Determinar tipo de distribución
    const distributionType = document.querySelector('input[name="distribution"]:checked').value

    // Crear equipos
    generatedTeams = []

    if (distributionType === "teams") {
      // Distribuir por número de equipos
      const teamCount = Number.parseInt(teamCountSelect.value)

      for (let i = 0; i < teamCount; i++) {
        generatedTeams.push([])
      }

      shuffled.forEach((participant, index) => {
        const teamIndex = index % teamCount
        generatedTeams[teamIndex].push(participant)
      })
    } else {
      // Distribuir por miembros por equipo
      const membersPerTeam = Number.parseInt(membersCountSelect.value)
      const numberOfTeams = Math.ceil(shuffled.length / membersPerTeam)

      for (let i = 0; i < numberOfTeams; i++) {
        const start = i * membersPerTeam
        const end = Math.min(start + membersPerTeam, shuffled.length)
        generatedTeams.push(shuffled.slice(start, end))
      }
    }

    // Mostrar resultados
    displayResults()
  }

  function displayResults() {
    // Actualizar título
    const title = titleInput.value.trim()
    resultsTitle.textContent = title || "Equipos Generados"

    // Limpiar grid de equipos
    teamsGrid.innerHTML = ""

    // Crear tarjetas de equipos
    generatedTeams.forEach((team, teamIndex) => {
      const teamCard = document.createElement("div")
      teamCard.className = "team-card"

      const teamTitle = document.createElement("h3")
      teamTitle.className = "team-title"
      teamTitle.textContent = `Equipo ${teamIndex + 1}`

      const membersList = document.createElement("ul")
      membersList.className = "team-members"

      team.forEach((member) => {
        const memberItem = document.createElement("li")
        memberItem.className = "team-member"

        if (member.startsWith("*")) {
          const leaderName = document.createElement("span")
          leaderName.className = "leader"
          leaderName.textContent = member.substring(1)

          memberItem.appendChild(leaderName)
          memberItem.appendChild(document.createTextNode(" (Líder)"))
        } else {
          memberItem.textContent = member
        }

        membersList.appendChild(memberItem)
      })

      teamCard.appendChild(teamTitle)
      teamCard.appendChild(membersList)
      teamsGrid.appendChild(teamCard)
    })

    // Cambiar a pantalla de resultados
    inputScreen.style.display = "none"
    resultsScreen.style.display = "block"
  }

  function downloadAsImage() {
    html2canvas(resultsContainer)
      .then((canvas) => {
        const image = canvas.toDataURL("image/jpeg", 0.9)

        const link = document.createElement("a")
        link.href = image
        link.download = `${titleInput.value || "equipos"}.jpg`
        link.click()
      })
      .catch((err) => {
        console.error("Error al generar la imagen:", err)
      })
  }

  function copyToClipboard() {
    const text = generatedTeams.map((team, index) => `Equipo ${index + 1}: ${team.join(", ")}`).join("\n")

    navigator.clipboard
      .writeText(text)
      .then(() => alert("Equipos copiados al portapapeles"))
      .catch((err) => console.error("Error al copiar:", err))
  }

  function copyColumnsToClipboard() {
    // Crear formato de tabla con columnas
    const maxLength = Math.max(...generatedTeams.map((team) => team.length))
    const rows = []

    // Crear fila de encabezado
    rows.push(generatedTeams.map((_, i) => `Equipo ${i + 1}`))

    // Crear filas de datos
    for (let i = 0; i < maxLength; i++) {
      const row = generatedTeams.map((team) => team[i] || "")
      rows.push(row)
    }

    // Convertir a texto separado por tabulaciones
    const text = rows.map((row) => row.join("\t")).join("\n")

    navigator.clipboard
      .writeText(text)
      .then(() => alert("Columnas copiadas al portapapeles"))
      .catch((err) => console.error("Error al copiar columnas:", err))
  }

  function goBack() {
    resultsScreen.style.display = "none"
    inputScreen.style.display = "block"
  }
})
