
const allPosts = JSON.parse(sessionStorage.getItem('aus_posts')||'[]');
let lastSelectedBuilding = null;

document.getElementById("quickCreateEvent").addEventListener("click", ()=>{
  if(lastSelectedBuilding){
    // save selected building temporarily
    sessionStorage.setItem("prefill_building", lastSelectedBuilding);
  }
  window.location.href = "create.html";
});

document.querySelectorAll(".map-spot").forEach(spot=>{
  spot.addEventListener("click", ()=>{
    const building = spot.dataset.label;

    document.getElementById("buildingTitle").textContent = building;
    
    renderBuildingEvents(building);

    document.getElementById("buildingModal").style.display="flex";
  });
});

document.getElementById("closeBuilding").addEventListener("click",()=>{
  document.getElementById("buildingModal").style.display="none";
});

window.addEventListener("click",(e)=>{
  if(e.target.id==="buildingModal"){
    document.getElementById("buildingModal").style.display="none";
  }
});

function renderBuildingEvents(building){
  const container = document.getElementById('mapEventsList');
  container.innerHTML = '';

  const events = allPosts.filter(p=>p.category==="Event" && p.building===building);

  if(!events.length){
    container.innerHTML = `<div class="text-muted small">No events created here yet.</div>`;
    return;
  }

//Producing a dedicated modal for each building came with its challenges, ChatGPT 5 was used to 
//determine a solution 
  events.forEach(ev=>{
  const div = document.createElement('div');
  div.className = "mb-3 p-3 glassEventCard";

  let imgMarkup = "";
  if(ev.imageData){
    imgMarkup = `
      <div class="mb-2">
      <img src="${ev.imageData}" style="width:100%;border-radius:12px;object-fit:cover;max-height:300px;"/>
      </div>
    `;
  }

  div.innerHTML = `
    ${imgMarkup}
    <strong>${ev.title}</strong><br>
    <span class="text-muted small">
    ${ev.eventDate ? ev.eventDate : ''} 
    ${ev.eventTime ? '@ ' + ev.eventTime : ''}
    </span><br>

    <div class="mt-1">${ev.body}</div>
  `;
  
  container.appendChild(div);
});


}
