import { getToken, getUserFromToken } from '../../../service/token.js';
const content = document.querySelector(".content");
const wordLabel = document.querySelector("#word-label");
const typeSection = document.querySelector("#type-section");
const typeContainer = typeSection.querySelector("#type-container");
const modalType = document.querySelector(".modal-type");
const antonymSection = document.querySelector("#antonym-section");
const antonymContainer = document.querySelector(".antonym-container");
const synonymSection = document.querySelector("#synonym-section");
const synonymContainer = document.querySelector(".synonym-container");

let action = "detail"
var typeTMPID = 0;
var pronunciationTMPID = 0;
var definitionTMPID = 0;
var synonymTMPID = 0;
var antonymTMPID = 0;
let token = '';
let states = ["normal", "edit", "active", "add", "delete", "error"];

let  word = {
    
  }
let typeNames = [

]

 
//lỗi
function renderWord(state) {
    renderWordLabel(state);

    renderTypeSection(state);
 
    renderAntonymSection(state);
    renderSynonymSection(state);
}

function renderWordLabel(state) {
    // wordLabel = document.querySelector("#word-label");
    // console.log(state);
    if (state === states[0]) {
        renderWordLabelNormal();
    } else if (state === states[1]) {
        renderWordLabelEdit();
    } 
   
}

function renderWordLabelNormal() {
    wordLabel.setAttribute("class", `${states[0]}`)
    wordLabel.querySelector("div.word-name").innerHTML = word.name;
    wordLabel.querySelector("input.word-name").value = word.name;
}

function renderWordLabelEdit() {
    wordLabel.setAttribute("class", `${states[1]}`);
    wordLabel.querySelector("div.word-name").innerHTML = word.name;
    wordLabel.querySelector("input.word-name").value = word.name;
   
}

function setUpWordButonContainerListener() {
    console.log("set up save word")
    wordLabel.querySelector(".btn-delete").replaceWith(wordLabel.querySelector(".btn-delete").cloneNode(true))
    wordLabel.querySelector(".btn-delete").addEventListener("click", function(event) {
        alert("Do you want delete word?");
        //console alert
        deleteWord();
    });

    wordLabel.querySelector(".btn-edit").addEventListener("click", function(event) {
        renderWord(states[1])
        // renderWordLabel(states[1]);
        // renderTypeSection(states[1]);
    });
    wordLabel.querySelector(".btn-save").replaceWith(wordLabel.querySelector(".btn-save").cloneNode(true))
    wordLabel.querySelector(".btn-save").addEventListener("click", function(event) {
        //validate
        // alert("click save word")
        if(!validateWordName() || !validateListType()){
           
            alert("failed save word");
        }
        else{
            // Gọi API để lưu thay đổi
            alert('Do you want to save word?')
            console.log("save word: " +  JSON.stringify(word));
            console.log(action)
            if(action === "add"){
                callAddWord();
            }else if(action === "detail"){
                callSaveWord();
            }
            // renderWord(states[1])
            renderWord(states[0]);
            // renderWordLabel(states[0]);
            // renderTypeSection(states[0]);
        }
        
    });
}

function validateWordName() {
    word.name = word.name.trim();
    if(word.name === "" || word.name === null){
        wordLabel.querySelector(".error-message").innerHTML = "Word name cannot be empty.";
        wordLabel.querySelector(".error-message").setAttribute("style","display: block;" )
        wordLabel.querySelector("input").setAttribute("class", "word-name error")
        return false;
    }
    wordLabel.querySelector(".error-message").innerHTML = "";
    wordLabel.querySelector(".error-message").setAttribute("style","display: none;" )
    wordLabel.querySelector("input").setAttribute("class", "word-name")
    return true;
}

function validateListType(){
    if(word.typeList.length  <= 0){
        typeSection.querySelector(".error-message").innerHTML = "List types cannot be empty.";
        typeSection.querySelector(".error-message").setAttribute("style","display: block;" )
        return false;
    }
    typeSection.querySelector(".error-message").innerHTML = "List types cannot be empty.";
    typeSection.querySelector(".error-message").setAttribute("style","display: none;" )
    return true;
}

function setUpWordNameListener() {
    wordLabel.querySelector("input.word-name").addEventListener("input", function(event) {
        word.name =  event.target.value;
    });
}



//type-section
function renderTypeSection(typeSectionState){
    if(typeSectionState === states[0]){
        renderTypeSectionNormal();
    }
    else if(typeSectionState === states[1]){
        renderTypeSectionEdit();
    }
    // setUpAddTypeListener();
    // renderTypeContainer(typeState);
}

function renderTypeSectionNormal(){
    typeSection.querySelector("#btn-add-type").setAttribute("style", "display: none");
    renderTypeContainerNormal();
}

function renderTypeSectionEdit(){
    typeSection.querySelector("#btn-add-type").setAttribute("style", "display: flex");
    renderTypeContainerActive();
}


function renderTypeContainerNormal(){
    typeContainer.innerHTML = "";
    word.typeList.forEach(type => {
        typeContainer.appendChild(renderTypeItem(type, states[0], states[0]));
    })
}

function renderTypeContainerActive(){
    typeContainer.innerHTML = "";
    word.typeList.forEach(type => {
        var typeelem = renderTypeItem(type, states[2], states[0]);
        typeContainer.appendChild(renderTypeItem(type, states[2], states[0]));
        console.log("type elem " + typeelem)
    })
}

function setUpAddTypeListener(){
    console.log("call setup add type");
    typeSection.querySelector("#btn-add-type").replaceWith(typeSection.querySelector("#btn-add-type").cloneNode(true));

    typeSection.querySelector("#btn-add-type").addEventListener("click", function(event){
        // alert("Do you want to add type?")
        typeSection.querySelector(".error-message").innerHTML = "List types cannot be empty.";
        typeSection.querySelector(".error-message").setAttribute("style","display: none;" )
       
        // type, modalState
        var newType = {
            "tmpid": typeTMPID++,
            "id": "",
            "type": "verb",
            "pronunciationsList": [
              {
                "tmpid": pronunciationTMPID++,
                "id": "",
                "region": "",
                "audio": "",
                "pronunciation": ""
              }
            ],
            "definitionsList": [
              {
                "tmpid": definitionTMPID++,
                "id": "",
                "definition": "",
                "examples": ""
              }
            ]
        }
        word.typeList.push(newType)
        renderModalType(newType, states[3]);
    })
}



//type item
function renderTypeItem(type, typeState, itemState){
    var typeItemElement = renderTypeItemNormal(type, itemState);
    console.log("render at "+ typeState)
    if(typeState === states[2]) {
        typeItemElement =  renderTypeItemActive(type, itemState);
    }
    else if(typeState === states[1]){
        typeItemElement =  renderTypeItemEdit(type, itemState);
    }
    setUpTypeItemListener(type, typeItemElement);
    return typeItemElement;
}

function renderTypeItemNormal(type, itemState){
    console.log("itemState in type item normal" + itemState);
    var typeElement = document.createElement("div");
    typeElement.setAttribute("class", `type-item normal`);
   
    typeElement.innerHTML = `
                        <div class = "word-of-type">Edit ${type.type} of ${word.name}</div>
                        <div class = "type-id-container">
                            <input type="text" placeholder="type-id" value="${type.id}" class="type-id" readonly style ="display: none"/>
                            <input type="text" placeholder="tmpid" value="${type.tmpid}" class="position" readonly style ="display: none"/>
                        </div>
                        <div class = "type-label">
                            <div class = "type-name">
                                <strong><span> ${type.type}</span></strong>                    
                            </div>
                            <div class="btn-container">
                                <button class = "btn btn-delete"  ><i class="fas fa-trash-alt"></i></button>
                                <button class = "btn btn-edit"  ><i class="fas fa-edit"></i></button>
                            </div>
                        </div>`
                        // console.log(renderPronunciationSection(type.pronunciationsList, states[0]))
    typeElement.appendChild(renderPronunciationSection(type.pronunciationsList, states[0], itemState));
    typeElement.appendChild(renderDefinitionSection(type.definitionsList, states[0], itemState));

    let btnSaveTypeContainer = document.createElement("div");
    btnSaveTypeContainer.setAttribute("class", "btn-container");
    btnSaveTypeContainer.innerHTML = `<button class="save-type btn btn-save" >Ok</button>`
    
    typeElement.appendChild(btnSaveTypeContainer);
   //click save type
    btnSaveTypeContainer.querySelector(".btn-save")
    return typeElement;
}



function renderTypeItemActive(type, itemState){
    console.log("itemState in type item Active" + itemState);
    var typeElement = document.createElement("div");
    typeElement.setAttribute("class", `type-item active`);
    typeElement.innerHTML = `
                        <div class = "word-of-type">Edit ${type.type} of ${word.name}</div>
                        <div class = "type-id-container">
                            <input type="text" placeholder="type-id" value="${type.id}" class="type-id" readonly style ="display: none"/>
                            <input type="text" placeholder="tmpid" value="${type.tmpid}" class="position" readonly style ="display: none"/>
                        </div>
                        <div class = "type-label">
                            <div class = "type-name">
                                <strong><span> ${type.type}</span></strong>                    
                            </div>
                            <div class="btn-container">
                                <button class = "btn btn-delete"  ><i class="fas fa-trash-alt"></i></button>
                                <button class = "btn btn-edit"  ><i class="fas fa-edit"></i></button>
                            </div>
                        </div>`
    typeElement.appendChild(renderPronunciationSection(type.pronunciationsList, states[0], itemState));
    typeElement.appendChild(renderDefinitionSection(type.definitionsList, states[0], itemState));

    let btnSaveTypeContainer = document.createElement("div");
    btnSaveTypeContainer.setAttribute("class", "btn-container");
    btnSaveTypeContainer.innerHTML = `<button class="save-type btn btn-save">Ok</button>`
    //click save type
    typeElement.appendChild(btnSaveTypeContainer);
    return typeElement;
}

function renderTypeItemEdit(type, itemState){
    console.log("itemState in type item edit" + itemState);
    var typeElement = document.createElement("div");
    typeElement.setAttribute("class", `type-item edit`);
    let typeLabel = ()=>{
        if(type.id === "" || type.id === null){
            return `Add new type`
        }
        return `Edit ${type.type} of ${word.name}`
    }
    typeElement.innerHTML = `
                        <div class = "word-of-type">${typeLabel()}</div>
                        <div class = "type-id-container">
                            <input type="text" placeholder="type-id" value="${type.id}" class="type-id" readonly style ="display: none"/>
                            <input type="text" placeholder="tmpid" value="${type.tmpid}" class="position" readonly style ="display: none"/>
                        </div>
                        <div class = "type-label">
                            <div class = "type-name">
                                <label>Type: </label>           
                            </div>
                            <div class="btn-container">
                                <button class = "btn btn-delete"  ><i class="fas fa-trash-alt"></i></button>
                                <button class = "btn btn-edit"  ><i class="fas fa-edit"></i></button>
                            </div>
                        </div>`
    typeElement.appendChild(renderPronunciationSection( type.pronunciationsList, states[1], itemState));
    typeElement.appendChild(renderDefinitionSection( type.definitionsList, states[1], itemState));
    typeElement.querySelector(".type-label").appendChild(renderSelectType(type))
    let btnSaveTypeContainer = document.createElement("div");
    btnSaveTypeContainer.setAttribute("class", "btn-container");
    btnSaveTypeContainer.innerHTML = `<button class="save-type btn btn-save">Ok</button>`
    
    typeElement.appendChild(btnSaveTypeContainer);
    return typeElement;
}

function renderSelectType(type){
    var haveSelected = false;
    let typeSelect = document.createElement("select");
    typeSelect.setAttribute("name", "type");
    typeSelect.setAttribute("class", "select-type");
    console.log(typeNames)
    typeNames.forEach(tp=>{
        let typeOption = document.createElement("option");
        typeOption.setAttribute("value", tp.type);
        typeOption.innerHTML = tp.type;
        console.log("tp.type: "+ tp.type + " length: " + tp.type.length);
        console.log("type.type: "+ type.type + " length: " + type.type.length);
        console.log("tp.type == type.type: " + (tp.type===type.type))
        if(tp.type===type.type){
            haveSelected = true;
            typeOption.setAttribute("selected", "selected");
        }
        typeSelect.appendChild(typeOption);
    })
    if(!haveSelected){
        typeSelect.firstChild.setAttribute("selected", "selected")
    }
    typeSelect.addEventListener("change", function(event){
        type.type = event.target.value;
    })
    return typeSelect;
     
}

function setUpTypeItemListener(type, typeItemElement){
    typeItemElement.querySelector(".btn-delete").addEventListener("click", function(event){
        alert("Do you want to save type?")
        if(word.typeList.length > 1){
            let indexToRemove = word.typeList.indexOf(type);
            word.typeList.splice(indexToRemove, 1);
            console.log("delete success");
            console.log("after delete: " + JSON.stringify(word))
            typeItemElement.remove();
        }
        else{
            alert("Cần ít nhất 1 type");
        }
    })
    typeItemElement.querySelector(".btn-edit").addEventListener("click", function(event){
        renderModalType(type, states[1]);
    })
    typeItemElement.querySelector(".save-type").addEventListener("click", function(event){
        // renderModalType(type, states[2]);
        // alert("save type");
        // alert(modalType.querySelectorAll(".pronunciation-item.edit"));
        if(modalType.querySelectorAll(".pronunciation-item.edit").length > 0){
            alert("Vui lòng lưu các thay đổi của pronunciation");
        }
        else if(modalType.querySelectorAll(".definition-item.edit").length > 0){
           alert("Vui lòng lưu các thay đổi của definition");
        }
        else{
            modalType.setAttribute("style", "display: none");
            renderTypeSection(states[1]);
        }
      
    })
}


//pronunciations

function renderPronunciationSection( pronunciationsList, pronunciationSectionState, itemState){
    if(pronunciationSectionState===states[0]){
        return renderPronunciationSectionNormal( pronunciationsList, itemState);
    }
    return  renderPronunciationSectionActive( pronunciationsList, itemState);
}



function renderPronunciationSectionNormal( pronunciationsList, itemState){
    let pronunciationSectionElement = document.createElement("div");
    pronunciationSectionElement.setAttribute("class", `pronunciation-section normal`);
    let pronunciationLabel = document.createElement("div");
    pronunciationLabel.setAttribute("class", "label-container");
    pronunciationLabel.innerHTML = `<label>Pronunciations: </label>
                                <div class="btn-container">
                                    <button id = "btn-add-pronunciation" class="btn btn-add">Add pronunciations</button>
                                </div>`
    pronunciationSectionElement.appendChild(pronunciationLabel)                      
    //set click add pronunciations
    setOnClickAddPronunciation(pronunciationLabel.querySelector(".btn-add"),  pronunciationsList)

    pronunciationSectionElement.appendChild(renderPronunciationContainer(pronunciationsList, itemState)); //state pronunciation item
   
  
    return pronunciationSectionElement;
}

function renderPronunciationSectionActive(pronunciationsList, itemState){
    var pronunciationSectionElement = document.createElement("div");
    pronunciationSectionElement.setAttribute("class", `pronunciation-section active`);
    let pronunciationLabel = document.createElement("div");
    pronunciationLabel.setAttribute("class", "label-container");
    pronunciationLabel.innerHTML = `<label>Pronunciations: </label>
                                <div class="btn-container">
                                    <button id = "btn-add-pronunciation" class="btn btn-add">Add pronunciations</button>
                                </div>`
    pronunciationSectionElement.appendChild(pronunciationLabel)                      
    //set click add pronunciations
    setOnClickAddPronunciation(pronunciationLabel.querySelector(".btn-add"), pronunciationsList)
    pronunciationSectionElement.appendChild(renderPronunciationContainer(pronunciationsList, itemState));//state pronunciation item 
    return pronunciationSectionElement;
}



function renderPronunciationContainer( pronunciationsList, pronunitemState){
    
    if(pronunitemState === states[2]){
       return renderPronunciationContainerActive(pronunciationsList, pronunitemState);///item active => có nút dele, sửa
    }
    // else if(pronunitemState === states[1])
    return renderPronunciationContainerNormal(pronunciationsList, pronunitemState);//ko có gì

}
function renderPronunciationContainerNormal(pronunciationsList, itemState){
    let pronuncitationContainerElement = document.createElement("div");
    pronuncitationContainerElement.setAttribute("class", "pronunciation-container");
    pronunciationsList.forEach(pronunciation => {
        var pronunciationElement = renderPronunciationItem(pronunciationsList,pronunciation, itemState)
        pronuncitationContainerElement.appendChild(pronunciationElement);
        // setUpPronunciationItemListener(pronunciationElement, pronunciation);
    })
    return pronuncitationContainerElement;
}

function renderPronunciationContainerActive(pronunciationsList, itemState){
    let pronuncitationContainerElement = document.createElement("div");
    pronuncitationContainerElement.setAttribute("class", "pronunciation-container");
    pronunciationsList.forEach(pronunciation => {
        var pronunciationElement = renderPronunciationItem(pronunciationsList,pronunciation,itemState);
        pronuncitationContainerElement.appendChild(pronunciationElement);
        // setUpPronunciationItemListener(pronunciationElement, pronunciation);
    })
    return pronuncitationContainerElement;
}

function renderPronunciationItem(pronunciationsList, pronunciation, pronunitemState){
    let pronunciationItem = {};
    if(pronunitemState === states[1]){
        pronunciationItem= renderPronunciationItemEdit(pronunciation);
    }
    else  if(pronunitemState === states[2]){
        pronunciationItem= renderPronunciationItemActive(pronunciation);
    }
    else{
        pronunciationItem = renderPronunciationItemNormal(pronunciation);
        
    }
    console.log(pronunciationItem)
        console.log("JSON +"+JSON.stringify(pronunciation))
    setUpPronunciationItemListener(pronunciationsList, pronunciationItem, pronunciation)
    return pronunciationItem;
    
}

function renderPronunciationItemNormal(pronunciation){
    let pronunciationElement = document.createElement("div");
    pronunciationElement.setAttribute("class", `pronunciation-item ${states[0]}`);
    pronunciationElement.innerHTML = `<input type ="hidden" class= "pronunciation-id" value ="${pronunciation.id}"/>
                                <input type ="hidden" class = "pronunciation-index" value ="${pronunciation.tmpid}"/>
                                <div  class="region" >${pronunciation.region}</div>
                                <div  class="pronunciation">${pronunciation.pronunciation}</div>
                                <input type ="hidden" class = "audio" value ="${pronunciation.audio}"/>
                                <audio src="${pronunciation.audio}" ></audio> 
                                <i class="fa fa-volume-up"></i>
                                 <div class="btn-container">
                                    <button class = "btn btn-delete btn-delete-pronunciation""  ><i class="fas fa-trash-alt"></i></button>
                                    <button class = "btn btn-edit btn-edit-pronunciation"  ><i class="fas fa-edit"></i></button>
                                    <button class = "btn btn-save btn-save-pronunciation"  ><i class="fas fa-save"></i></button>
                                </div>`;
    return pronunciationElement;
}

function renderPronunciationItemActive(pronunciation){
    let pronunciationElement = document.createElement("div");
    pronunciationElement.setAttribute("class", `pronunciation-item ${states[2]}`);
    pronunciationElement.innerHTML = `<input type ="hidden" class= "pronunciation-id" value ="${pronunciation.id}"/>
                                <input type ="hidden" class = "pronunciation-index" value ="${pronunciation.tmpid}"/>
                                <div  class="region" >${pronunciation.region}</div>
                                <div  class="pronunciation">${pronunciation.pronunciation}</div>
                                <input type ="hidden" class = "audio" value ="${pronunciation.audio}"/>
                                <audio src="${pronunciation.audio}" ></audio> 
                                <i class="fa fa-volume-up"></i>
                                 <div class="btn-container">
                                    <button class = "btn btn-delete btn-delete-pronunciation""  ><i class="fas fa-trash-alt"></i></button>
                                    <button class = "btn btn-edit btn-edit-pronunciation"  ><i class="fas fa-edit"></i></button>
                                    <button class = "btn btn-save btn-save-pronunciation"  ><i class="fas fa-save"></i></button>
                                </div>`;
    return pronunciationElement;
}

function renderPronunciationItemEdit(pronunciation){
    let pronunciationElement = document.createElement("div");
    pronunciationElement.setAttribute("class", `pronunciation-item ${states[1]}`);
    pronunciationElement.innerHTML = `<input type ="hidden" class= "pronunciation-id" value ="${pronunciation.id}"/>
                                <input type ="hidden" class = "pronunciation-index" value ="${pronunciation.tmpid}"/>
                                <input type = "text" class="region" placeholder = "Region" value = "${pronunciation.region}"/>
                                <input type = "text" class="pronunciation" placeholder = "Region" value = "${pronunciation.pronunciation}"/>
                                <input type = "text" placeholder="Audio" class = "audio" value ="${pronunciation.audio}"/>
                                <audio src="${pronunciation.audio}" ></audio> 
                                <i class="fa fa-volume-up"></i>
                                 <div class="btn-container">
                                    <button class = "btn btn-delete btn-delete-pronunciation""  ><i class="fas fa-trash-alt"></i></button>
                                    <button class = "btn btn-edit btn-edit-pronunciation"  ><i class="fas fa-edit"></i></button>
                                    <button class = "btn btn-save btn-save-pronunciation"  ><i class="fas fa-save"></i></button>
                                </div>`;
    return pronunciationElement;
}



function setOnClickAddPronunciation(addPronunciationButton, pronunciationsList){
    addPronunciationButton.addEventListener("click", function(event){
        var pronunciation =  {
            "tmpid": pronunciationTMPID++,
            "id": "",
            "region": "",
            "audio": "",
            "pronunciation": ""
        }
        pronunciationsList.push(
           pronunciation
        )
        //chua them vao word
        let pronunciationItem = renderPronunciationItem(pronunciationsList, pronunciation, states[1]);
        modalType.querySelector(".type-item").querySelector(".pronunciation-container").appendChild(pronunciationItem);
        // setUpPronunciationItemListener(pronunciationItem,pronunciation );
    
    });
}

function setUpPronunciationItemListener(pronunciationsList,pronunciationItemElement, pronunciation){
    pronunciationItemElement.querySelector(".btn-delete").addEventListener("click", function(event){
        if(pronunciationsList.length > 1){
            var index= pronunciationsList.indexOf(pronunciation);
            pronunciationsList.splice(index, 1);
            pronunciationItemElement.remove();
        }
        else{
            alert("Cần ít nhất 1 pronunciation")
        }
        

    });
    pronunciationItemElement.querySelector(".btn-edit").addEventListener("click", function(event){
        let pronunEditElement = renderPronunciationItem(pronunciationsList, pronunciation, states[1]);
        pronunciationItemElement.parentElement.replaceChild(pronunEditElement, pronunciationItemElement )
    });
    pronunciationItemElement.querySelector(".btn-save").addEventListener("click", function(event){
        let s = validatePronunciation(pronunciationItemElement, pronunciation);
        if(!s){
            alert("Không được để trống")
        }
        else{
            let pronunEditElement = renderPronunciationItem(pronunciationsList, pronunciation, states[2]);
            pronunciationItemElement.parentElement.replaceChild(pronunEditElement, pronunciationItemElement );
        }
    });
}

function validatePronunciation(pronunciationItemElement, pronunciation){
    var region = pronunciationItemElement.querySelector(".region").value;
    var pronun =  pronunciationItemElement.querySelector(".pronunciation").value;
    var audio = pronunciationItemElement.querySelector(".audio").value;
    if(region.trim() === "" || pronun.trim() === "" || audio.trim() === "" ){
        return false;
    }
    pronunciation.region = region;
    pronunciation.pronunciation = pronun;
    pronunciation.audio = audio;
    return true;
}

//definitions

function renderDefinitionSection(definitionsList, definitionSectionState, itemState){
    console.log("item State in definition Section" + itemState);
    if(definitionSectionState===states[0]){
        return renderDefinitionSectionNormal( definitionsList, itemState);
    }
    if(definitionSectionState===states[2]){
        return renderDefinitionSectionActive( definitionsList, itemState);
    }
    return  renderDefinitionSectionActive( definitionsList, itemState);
}

function renderDefinitionSectionNormal(definitionsList, itemState){
    console.log("itemState in definition section normal: " + itemState)
    let definitionSectionElement = document.createElement("div");
    definitionSectionElement.setAttribute("class", `definition-section normal`);
   

    let definitionLabelElement = document.createElement("div");
    definitionLabelElement.setAttribute("class", "label-container");
    definitionLabelElement.innerHTML = `<label>Definitions: </label>
                                <div class="btn-container">
                                    <button id = "btn-add-definition" class="btn btn-add">Add definition</button>
                                </div>`
    definitionSectionElement.appendChild(definitionLabelElement);
    //set click add definition
    setOnClickAddDefinition(definitionLabelElement.querySelector(".btn-add"),  definitionsList)

    definitionSectionElement.appendChild(renderDefinitionContainer(definitionsList, itemState)); //state definition item
    return definitionSectionElement;
}

function renderDefinitionSectionActive(definitionsList, itemState){
    console.log("itemState in definition section: " + itemState)
    let definitionSectionElement = document.createElement("div");
    definitionSectionElement.setAttribute("class", `definition-section active`);

    let definitionLabelElement = document.createElement("div");
    definitionLabelElement.setAttribute("class", "label-container");
    definitionLabelElement.innerHTML = `<label>Definitions: </label>
                                <div class="btn-container">
                                    <button id = "btn-add-definition" class="btn btn-add">Add definition</button>
                                </div>`
    definitionSectionElement.appendChild(definitionLabelElement);
     //set click add definition
     setOnClickAddDefinition(definitionLabelElement.querySelector(".btn-add"),  definitionsList)
    definitionSectionElement.appendChild(renderDefinitionContainer(definitionsList, itemState)); //state definition item

   
    return definitionSectionElement;
}

function renderDefinitionContainer(definitionsList, definitionItemState){
    console.log("definition: " + definitionItemState)
    
    if(definitionItemState === states[2]){
        return renderDefinitionContainerActive(definitionsList, definitionItemState);///item active => có nút dele, sửa
     }
     // else if(pronunitemState === states[1])
     return renderDefinitionContainerNormal(definitionsList, definitionItemState);//ko có gì
 
}

function renderDefinitionContainerActive(definitionsList, itemState){
    let definitionContainerElement = document.createElement("div");
    definitionContainerElement.setAttribute("class", "definition-container");
    definitionsList.forEach(definition => {
        definitionContainerElement.appendChild(renderDefinitionItem(definitionsList, definition, itemState));
    })
    return definitionContainerElement;
}

function renderDefinitionContainerNormal(definitionsList, itemState){
    let definitionContainerElement = document.createElement("div");
    definitionContainerElement.setAttribute("class", "definition-container");
    definitionsList.forEach(definition => {
        definitionContainerElement.appendChild(renderDefinitionItem(definitionsList, definition,itemState));
    })
    return definitionContainerElement;
}

function renderDefinitionItem(definitionsList, definition, definitionItemState){
    
    let defintionItem = {};
    if(definitionItemState === states[1]){
        defintionItem= renderDefinitionItemEdit(definition);
    }
    else if(definitionItemState === states[2]){
        defintionItem= renderDefinitionItemActive(definition);
    }
    else{
        defintionItem= renderDefinitionItemNormal(definition);
    }
    setUpDefinitionItemListener(definitionsList, defintionItem, definition);
    return defintionItem;
}


function renderDefinitionItemNormal(definition){
    let definitionElement = document.createElement("div");
    definitionElement.setAttribute("class", `definition-item ${states[0]}`);
    definitionElement.innerHTML = `<input type ="hidden" class = "definition-index" value ="${definition.tmpid}"/>
                                <input type ="hidden" class = "definition-id" value ="${definition.id}"/>
                                <div class="definition">${definition.definition}</div>
                                <div class="example ">${definition.examples}</div> 
                                <div class="btn-container">
                                    <button class = "btn btn-delete btn-delete-definition"  ><i class="fas fa-trash-alt"></i></button>
                                     <button class = "btn btn-edit btn-edit-definition"  ><i class="fas fa-edit"></i></button>
                                    <button class = "btn btn-save btn-save-definition"  ><i class="fas fa-save"></i></button>
                                </div>`;
    return definitionElement;

}



function renderDefinitionItemActive(definition){
    let definitionElement = document.createElement("div");
    definitionElement.setAttribute("class", `definition-item ${states[2]}`);
    definitionElement.innerHTML = `<input type ="hidden" class = "definition-index" value ="${definition.tmpid}"/>
                                <input type ="hidden" class = "definition-id" value ="${definition.id}"/>
                                <div class="definition">${definition.definition}</div>
                                <div class="example ">${definition.examples}</div> 
                                <div class="btn-container">
                                    <button class = "btn btn-delete btn-delete-definition"  ><i class="fas fa-trash-alt"></i></button>
                                     <button class = "btn btn-edit btn-edit-definition"  ><i class="fas fa-edit"></i></button>
                                    <button class = "btn btn-save btn-save-definition"  ><i class="fas fa-save"></i></button>
                                </div>`;
    return definitionElement;

    
}
function renderDefinitionItemEdit(definition){
    let definitionElement = document.createElement("div");
    definitionElement.setAttribute("class", `definition-item ${states[1]}`);
    definitionElement.innerHTML = `<input type ="hidden" class = "definition-index" value ="${definition.tmpid}"/>
                                <input type ="hidden" class = "definition-id" value ="${definition.id}"/>
                                <input type = "text" placeholder="Definition" class = "definition" value = "${definition.definition}"/>
                                <textarea  placeholder="Example" class = "example" value = "${definition.examples}" >${definition.examples}</textarea>
                                <div class="btn-container">
                                    <button class = "btn btn-delete btn-delete-definition"  ><i class="fas fa-trash-alt"></i></button>
                                     <button class = "btn btn-edit btn-edit-definition"  ><i class="fas fa-edit"></i></button>
                                    <button class = "btn btn-save btn-save-definition"  ><i class="fas fa-save"></i></button>
                                </div>`;
    return definitionElement;

}



function setOnClickAddDefinition(addDefinitionButton, definitionsList){
    addDefinitionButton.addEventListener("click", function(event){
        var definition = {
            "tmpid": definitionTMPID++,
            "id": "",
            "definition": "",
            "examples": ""
          }
        definitionsList.push(definition);
        let definitionItem = renderDefinitionItem(definitionsList, definition, states[1]);
        modalType.querySelector(".type-item").querySelector(".definition-container").appendChild(definitionItem);
    })
}

// function setUpPronunciationItemListener(pronunciationsList,pronunciationItemElement, pronunciation){
//     pronunciationItemElement.querySelector(".btn-delete").addEventListener("click", function(event){
//         if(pronunciationsList.length > 1){
//             var index= pronunciationsList.indexOf(pronunciation);
//             pronunciationsList.splice(index, 1);
//             pronunciationItemElement.remove();
//         }
//         else{
//             alert("Cần ít nhất 1 pronunciation")
//         }
        

//     });
//     pronunciationItemElement.querySelector(".btn-edit").addEventListener("click", function(event){
//         let pronunEditElement = renderPronunciationItem(pronunciationsList, pronunciation, states[1]);
//         pronunciationItemElement.parentElement.replaceChild(pronunEditElement, pronunciationItemElement )
//     });
//     pronunciationItemElement.querySelector(".btn-save").addEventListener("click", function(event){
//         let s = validatePronunciation(pronunciationItemElement, pronunciation);
//         if(!s){
//             alert("Không được để trống")
//         }
//         else{
//             let pronunEditElement = renderPronunciationItem(pronunciationsList, pronunciation, states[2]);
//             pronunciationItemElement.parentElement.replaceChild(pronunEditElement, pronunciationItemElement );
//         }
//     });
// }


function setUpDefinitionItemListener(definitionsList, definitionElement, definition){
    definitionElement.querySelector(".btn-delete").addEventListener("click", function(event){
        if(definitionsList.length > 1){
            var index= definitionsList.indexOf(definition);
            definitionsList.splice(index, 1);
            definitionElement.remove();
        }
        else{
            alert("Cần ít nhất 1 definition")
        }
        

    });
    definitionElement.querySelector(".btn-edit").addEventListener("click", function(event){
        let definitionEditElement = renderDefinitionItem(definitionsList, definition, states[1]);
        definitionElement.parentElement.replaceChild(definitionEditElement, definitionElement )
    });
    definitionElement.querySelector(".btn-save").addEventListener("click", function(event){
        let s = validateDefinition(definitionElement, definition);
        if(!s){
            alert("Không được để trống")
        }
        else{
            let definitionEditElement = renderDefinitionItem(definitionsList, definition, states[2]);
            definitionElement.parentElement.replaceChild(definitionEditElement, definitionElement );
        }
    })
}

function validateDefinition(definitionItemElement, definition){
    var defi = definitionItemElement.querySelector(".definition").value;
    var examples =  definitionItemElement.querySelector(".example").value;

    if(examples.trim() === "" || defi.trim() === ""){
        return false;
    }
    definition.definition = defi;
    definition.examples = examples;
    return true;
}

//Render antonyms
function renderAntonymSection(state){
    if(state === states[0]) renderAntonymSectionNormal();
    else renderAntonymSectionActive();
}

function renderAntonymSectionNormal(){
    antonymSection.querySelector("#antonym-search").setAttribute("style", "display: none");
    renderAntonymContainer();
}

function renderAntonymSectionActive(){
    antonymSection.querySelector("#antonym-search").setAttribute("style", "display: true");
    renderAntonymContainerEdit();
}

function renderAntonymContainer(){
    var htmls = "";
    word.antonymsList.forEach(antonym => {
        htmls += `<a class="antonym-item" href="#">
         <input type="hidden" class="tmpid" value="${antonym.tmpid}">
        <input type="hidden" class="antoynm-id" value="${antonym.id}">
        <input type="hidden" class="word-id"  value="${antonym.antonym.id}">
        <div class="name">${antonym.antonym.name}</div>
    </a>`;
    });
    if(htmls === "") htmls = "Antonym is none"
    antonymContainer.innerHTML = htmls;
    antonymContainer.querySelectorAll(".antonym-item").forEach(antonym => {
        antonym.addEventListener('click', function(event) {
            var url = `http://127.0.0.1:5501/template/admin/word_management/word_detail.html?id=${antonym.querySelector(".word-id").value}`;
            window.location.href = url;
        });

    });
}

function renderAntonymContainerEdit(){
    var htmls = "";
    word.antonymsList.forEach(antonym => {
        htmls += `<a class="antonym-item edit" href="#">
         <input type="hidden" class="tmpid" value="${antonym.tmpid}">
        <input type="hidden" class="antonym-id" value="${antonym.id}">
        <input type="hidden" class="word-id"  value="${antonym.antonym.id}">
        <div class="name">${antonym.antonym.name}</div>
    </a>`;
    });
    if(htmls === "") htmls = "Antonym is none"
    antonymContainer.innerHTML = htmls;
    antonymContainer.querySelectorAll(".edit").forEach(antonym => {
        antonym.addEventListener('click', function(event) {
            const rect = antonym.getBoundingClientRect();
            const x = event.clientX - rect.right + 20; // 20 is the width of the ::after element
            const y = event.clientY - rect.top + 5;   // 5 is the top offset of the ::after element
            
            if (x >= 0 && x <= 20 && y >= 0 && y <= 20) {
                const tmpid = antonym.querySelector(".tmpid").value;
                word.antonymsList = word.antonymsList.filter(a => a.tmpid != tmpid);
                renderAntonymContainerEdit();
            }
            
        });
    });
}


function setUpAntonymSearchListener(){
    antonymSection.querySelector("#antonym-search").addEventListener("input", async function(event){
        let wordName = event.target.value;
        let listWord = await fetchWordByName(wordName);
        renderAntonymResultSearch(listWord);
    })
}



function renderAntonymResultSearch(listWord){
    let resultSearch = antonymSection.querySelector(".result-search");
    resultSearch.innerHTML = "";
    if(listWord.length > 0){
        listWord.forEach(wordItem => {
            let wordItemElement = document.createElement("li");
            let idcontainer = document.createElement("input");
            idcontainer.setAttribute("type", "hidden");
            idcontainer.setAttribute("value", wordItem.id)
            let wordName = document.createElement("div")
            wordName.innerHTML = wordItem.name;
            // url.appendChild(wordName);
            wordItemElement.appendChild(idcontainer);
            wordItemElement.appendChild(wordName);
            resultSearch.appendChild(wordItemElement);
            wordItemElement.addEventListener("click", function(event){
                addNewAntonym(wordItem);
            })
        })
    }
}

function addNewAntonym(wordItem){
    var isExisted = false;
    // const item = word.antonymsList.find(atn => atn.antonym === wordItem);
    word.antonymsList.forEach(atn => {
        if(atn.antonym.id === wordItem.id){
            isExisted = true;
        }
    })
    if(!isExisted){
        let antonymItemFE = {
            tmpid: antonymTMPID++,
            id: "",
            antonym: wordItem
        }
        word.antonymsList.push(antonymItemFE);
        renderWord(states[1]);
        antonymSection.querySelector(".result-search").innerHTML = "";
        antonymSection.querySelector("#antonym-search").value = "";
    }

}


//Render synonyms
function renderSynonymSection(state){
    console.log("call synonym section: " + state)
    if(state === states[0]) renderSynonymSectionNormal();
    else renderSynonymSectionActive();
}

function renderSynonymSectionNormal(){
    synonymSection.querySelector("#synonym-search").setAttribute("style", "display: none");
    renderSynonymsContainer();
}

function renderSynonymSectionActive(){
    synonymSection.querySelector("#synonym-search").setAttribute("style", "display: true");
    renderSynonymsContainerEdit();
    console.log("call synonym edit")
}

function renderSynonymsContainer(){
    var htmls = "";
    word.synonymsList.forEach(synonym => {
        htmls += `<div class="synonym-item">
                <input type="hidden" class="tmp-id" value="${synonym.tmpid}">
                <input type="hidden" class="synonym-id" value="${synonym.id}">
                <input type="hidden" class="word-id"  value="${synonym.synonym.id}">
                <div class="name">${synonym.synonym.name}</div>
            </div>`;
    });
    if(htmls === "") htmls = "Synonym is none"
    synonymContainer.innerHTML = htmls;
    synonymContainer.querySelectorAll(".synonym-item").forEach(synonym => {
        synonym.addEventListener('click', function(event) {
            var url = `http://127.0.0.1:5501/template/admin/word_management/word_detail.html?id=${synonym.querySelector(".word-id").value}`;
            window.location.href = url;
        });
    });
}


function renderSynonymsContainerEdit(){
    var htmls = "";
    word.synonymsList.forEach(synonym => {
        htmls += `<div class="synonym-item edit">
                <input type="hidden" class="tmpid" value="${synonym.tmpid}">
                <input type="hidden" class="synonym-id" value="${synonym.id}">
                <input type="hidden" class="word-id"  value="${synonym.synonym.id}">
                <div class="name">${synonym.synonym.name}</div>
            </div>`;
    });
    if(htmls === "") htmls = "Synonym is none"
    synonymContainer.innerHTML = htmls;
    synonymContainer.querySelectorAll(".edit").forEach(synonym => {
        synonym.addEventListener('click', function(event) {
            const rect = synonym.getBoundingClientRect();
            const x = event.clientX - rect.right + 20; // 20 is the width of the ::after element
            const y = event.clientY - rect.top + 5;   // 5 is the top offset of the ::after element
            
            // Check if click was within the ::after element's area
            if (x >= 0 && x <= 20 && y >= 0 && y <= 20) {
                // Trigger your delete action here
                const tmpid = synonym.querySelector(".tmpid").value;
                word.synonymsList = word.synonymsList.filter(a => a.tmpid != tmpid);
                renderSynonymsContainerEdit();
            }
        });

    })
}



function setUpSynonymSearchListener(){
    synonymSection.querySelector("#synonym-search").addEventListener("input", async function(event){
        let wordName = event.target.value;
        let listWord = await fetchWordByName(wordName);
        renderSynonyResultSearch(listWord);
    })
}



function renderSynonyResultSearch(listWord){
    let resultSearch = synonymSection.querySelector(".result-search");
    resultSearch.innerHTML = "";
    if(listWord.length > 0){
        listWord.forEach(wordItem => {
            let wordItemElement = document.createElement("li");
            let idcontainer = document.createElement("input");
            idcontainer.setAttribute("type", "hidden");
            idcontainer.setAttribute("value", wordItem.id)
            let wordName = document.createElement("div")
            wordName.innerHTML = wordItem.name;
            // url.appendChild(wordName);
            wordItemElement.appendChild(idcontainer);
            wordItemElement.appendChild(wordName);
            resultSearch.appendChild(wordItemElement);
            wordItemElement.addEventListener("click", function(event){
                addNewSynonym(wordItem);
            })
        })
    }
}

function addNewSynonym(wordItem){
    var isExisted = false;
    // const item = word.synonymsList.find(snn => snn.synonym === wordItem);
    word.synonymsList.forEach(snn => {
        if(snn.synonym.id === wordItem.id){
            isExisted = true;
        }
    })
    if(!isExisted){
        let synonymItemFE = {
            tmpid: synonymTMPID++,
            id: "",
            synonym: wordItem
        }
        word.synonymsList.push(synonymItemFE);
        renderWord(states[1]);
        synonymSection.querySelector(".result-search").innerHTML = "";
        synonymSection.querySelector("#synonym-search").value = "";
    }

}

//render modal edit 

function renderModalType(type, modalState){

    if(modalState===states[1]){
        renderModalEditType(type);
    }
     else renderModalAddType(type);
}

function renderModalEditType(type){
    modalType.innerHTML = "";
    modalType.appendChild(renderModalContent(type, states[2]));
    modalType.setAttribute("style", "display: flex");
}

function renderModalAddType(type){
    modalType.innerHTML = "";
    modalType.appendChild(renderModalContent(type, states[1]));
    modalType.setAttribute("style", "display: flex");
}

function renderModalContent(type, itemState){
    let modalContentElement = document.createElement("div");
    modalContentElement.setAttribute("class", "modal-content");
    modalContentElement.appendChild(renderTypeItem(type, states[1], itemState)) ;
    return modalContentElement;
}

//render modal add



function converWordFEToWordBE(data){
    var word = {
        id: data.id,
        name: data.name,
        typeList: [],
        antonymsList: [],
        synonymsList: []
    }
    if(data.id === "" || data.id === null){
        word = {
            name: data.name,
            typeList: [],
            antonymsList: [],
            synonymsList: []
        }
    }

    data.typeList.forEach(typefe=> {
        var typebe  = {
            type: typefe.type,
            pronunciationsList: [],
            definitionsList: []
        };
        if(typefe.id !== ""){
            typebe = {
                id: typefe.id,
                type: typefe.type,
                pronunciationsList: [],
                definitionsList: []
            };
        }
        
        typebe.pronunciationsList = typefe.pronunciationsList.map(tp =>{
            if(tp.id !== ""){
                return {
                    id: tp.id,
                    region: tp.region,
                    audio: tp.audio,
                    pronunciation: tp.pronunciation
                }
            }
            return {
                region: tp.region,
                audio: tp.audio,
                pronunciation: tp.pronunciation
            }
        })
        typebe.definitionsList = typefe.definitionsList.map(tp => {
            if(tp.id !== ""){
                return {
                    id: tp.id,
                    definition: tp.definition,
                    examples: tp.examples
                }
            }
            return {
                definition: tp.definition,
                examples: tp.examples
            }
        })
        word.typeList.push(typebe);
    });
    word.antonymsList = data.antonymsList.map(tp => {
        if(tp.id !== ""){
            return  {
                id: tp.id,
                antonym:tp.antonym
            };
        }
        return  {
            antonym:tp.antonym
        };
    })
    word.synonymsList = data.synonymsList.map(tp => {
        if(tp.id !== ""){
            return  {
                id: tp.id,
                synonym:tp.synonym
            };
        }
        return  {
            synonym:tp.synonym
        };
    })
    return word;
}



function convertWordBEToWordFE(data){
    var word = {
        id: data.id,
        name: data.name,
        typeList: [],
        antonymsList: [],
        synonymsList: []
    }
    data.typeList.forEach(typebe=> {
        var feType = {
            tmpid: typeTMPID++,
            id: typebe.id,
            type: typebe.type,
            pronunciationsList: [],
            definitionsList: []
        };
        feType.pronunciationsList = typebe.pronunciationsList.map(tp => ({
            tmpid: pronunciationTMPID++,
            id: tp.id,
            region: tp.region,
            audio: tp.audio,
            pronunciation: tp.pronunciation
        }))
        feType.definitionsList = typebe.definitionsList.map(tp => ({
            tmpid: definitionTMPID++,
            id: tp.id,
            definition: tp.definition,
            examples: tp.examples
        }))
        word.typeList.push(feType);
    })
    data.antonymsList.forEach(atnbe=>{
        var feAntonym = {
            tmpid: antonymTMPID++,
            id: atnbe.id,
            antonym:atnbe.antonym
        };
        word.antonymsList.push(feAntonym);
        
    })
    data.synonymsList.forEach(snnbe=>{
        var feSynonym = {
            tmpid: synonymTMPID++,
            id: snnbe.id,
            synonym:snnbe.synonym
        };
        word.synonymsList.push(feSynonym);
        
    })
    console.log(JSON.stringify(word));
    return word;
}

//call api

async function getWord(wordID){
    // const params = new URLSearchParams(window.location.search);
    // const wordID = params.get('id'); // e.g., "1"
    const apiURL = `http://localhost:8080/api/v1/admin/words/${wordID}`;
    const response = await fetch(apiURL,{
            method: 'GET', // or 'POST', 'PUT', etc.
            headers: {
                'Authorization': `Bearer ${token}`, // Add token to the Authorization header
                'Content-Type': 'application/json',
                // Add other headers if needed
            }
    }
    );

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    // console.log(data);

    // word = data;
    
    word = convertWordBEToWordFE(data);
    // renderWord();
    renderWord(states[0]);
    console.log(word);
}

async function getTypeNames() {
    const api = `http://localhost:8080/api/v1/admin/types`;
    const response = await fetch(api, {
        method: 'GET', // or 'POST', 'PUT', etc.
        headers: {
            'authorization': `Bearer ${token}`, // Add token to the Authorization header
            'Content-Type': 'application/json',
            // Add other headers if needed
        }
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
   
    typeNames = data
    console.log("types: " +typeNames)
}

async function fetchWordByName(wordName) {
    if(wordName != "" && /[!@#$%^&*(),.?":{}|<>\\\/]/.test(wordName) === false){
        var apiURL = `http://localhost:8080/api/v1/admin/words?name=${wordName}`;

        const response = await fetch(apiURL, {
            method: 'GET', // or 'POST', 'PUT', etc.
            headers: {
                'Authorization': `Bearer ${token}`, // Add token to the Authorization header
                'Content-Type': 'application/json',
                // Add other headers if needed
            }
        });
        const data = await response.json();
        
        console.log(data)    
        return data;
    }
    return []
}

async function deleteWord() {
    const apiURL = `http://localhost:8080/api/v1/admin/words/${word.id}`;
    
    const response = await fetch(apiURL, {
        method: 'DELETE', // Chuyển phương thức thành POST
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json', // Xác định loại nội dung là JSON
        },
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    document.querySelector('.sidebar ul li a[href="#word"]').click();
    // const data = await response.json();
    // var url = `http://127.0.0.1:5502/template/admin/word_management/word_management.html`;
    // window.location.href = url;


}

async function callAddWord() {
    const apiURL = `http://localhost:8080/api/v1/admin/words`;
    let addWord= converWordFEToWordBE(word);
    console.log("before call Add word: " + JSON.stringify(addWord));

    const response = await fetch(apiURL, {
        method: 'POST', // Chuyển phương thức thành POST
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json', // Xác định loại nội dung là JSON
        },
        body: JSON.stringify(addWord) // Chuyển đổi đối tượng thành chuỗi JSON
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    word = convertWordBEToWordFE(data);
    // window.location.href = `word_detail.html?id=${word.id}`
    renderAddWord("detail", word.id);

}

async function callSaveWord() {

    var updateWord = converWordFEToWordBE(word);
    console.log("before call: " + JSON.stringify(updateWord));
    const apiURL = `http://localhost:8080/api/v1/admin/words/${updateWord.id}`;
    
    const response = await fetch(apiURL, {
        method: 'PUT', // Chuyển phương thức thành POST
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json', // Xác định loại nội dung là JSON
        },
        body: JSON.stringify(updateWord) // Chuyển đổi đối tượng thành chuỗi JSON
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    word = convertWordBEToWordFE(data);
   
    renderWord(states[0]);
    console.log("word Call save: " + JSON.stringify(data));
   
}

function renderAddWord(actionS, wordID) {
    // let requestURL = window.location.href;
    wordLabel.style.display = "flex"
    typeSection.style.display = "flex"
    // modalType.style.display = "none"
    antonymSection.style.display = "flex"
    synonymSection.style.display = "flex" 
    token = getToken();
    if(token === null || token === ''){
        window.location.href = "http://127.0.0.1:5502/template/login.html"
    }

    // if(requestURL.includes("add_word.html")){
    if(actionS==="add_word"){
        action = "add"
        word = convertWordBEToWordFE(
            {   "id": "",
                "name": "",
                "typeList": [
                    
                ],
                "antonymsList": [],
                "synonymsList": [
                
                ]
            }
        )
        renderWord(states[1]);
    }
    else{
        action="detail"
        getWord(wordID);
    }
    getTypeNames();

    setUpWordButonContainerListener();
    setUpWordNameListener();
    setUpAddTypeListener();
    setUpAntonymSearchListener();
    setUpSynonymSearchListener();
   
}

export {renderAddWord}

// start();
