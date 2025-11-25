const searchBtn = document.getElementById("openSearch");
const searchModal = document.getElementById("searchModal");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

const dummyUsers = [
  {name:"Chihab"},
  {name:"Karim"},
  {name:"Ahmed"}
];


searchBtn.addEventListener("click", () => {
  searchModal.style.display="flex";
  searchInput.value="";
  searchResults.innerHTML="";
  searchInput.focus();
});

window.addEventListener("click",(e)=>{
  if(e.target === searchModal) searchModal.style.display="none";
});

searchInput.addEventListener("input",()=>{
  const q = searchInput.value.trim().toLowerCase();
  searchResults.innerHTML="";
  if(!q) return;
  const results = dummyUsers.filter(u=>u.name.toLowerCase().includes(q));
  if(results.length===0){
    searchResults.innerHTML=`<p class="text-muted small mb-0">No results</p>`;
    return;
  }
 results.forEach(u=>{
  searchResults.innerHTML += `
    <div class="border rounded p-2 mb-2 search-user-result" data-name="${u.name}" style="cursor:pointer;">
      <strong>${u.name}</strong>
    </div>`;
});

});

searchResults.addEventListener("click", (e)=>{
  const box = e.target.closest(".search-user-result");
  if(!box) return;

  const name = box.dataset.name;

//Currenty an alert is being used as a placeholder for actual data of other users
  alert("Loading profile for " + name);

  searchModal.style.display="none";
});
