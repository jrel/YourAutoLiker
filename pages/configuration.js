let modified = false;
window.onbeforeunload = s => modified ? "" : null; // show warning on tab closing if there are changes of data

class Page {
    constructor() {
        this.slider = document.getElementById('myRange');
        this.whenReactText = document.getElementsByClassName('percent')[0];
        this.sliderStartValue = undefined;
        this.likeList = undefined;
        this.dislikeList = undefined;
        this.likeSet = undefined;
        this.dislikeSet = undefined;
        this.likeContent = document.querySelector('.like > .content-box');
        this.dislikeContent = document.querySelector('.dislike > .content-box');
        this.saveBtn = document.querySelector('.save > .content-box > .btn');
        this.saveTitle = document.querySelector('.save > .header-box');
        this.numberOfRemovals = 0;
        this.saveBtn.onclick = saveData;
    }

    getListsValue() {
        getListsValue();
    }

    setChangesToBeSaved() {
        this.saveBtn.innerText = 'Salvar altereações';
        this.saveBtn.setAttribute('saved', 'false');
        this.saveTitle.innerText = 'Informações precisam ser salvas';
        modified = true;
    }

    setNoChanges() {
        this.saveBtn.innerText = 'Sem alterações';
        this.saveBtn.setAttribute('saved', 'true');
        this.saveTitle.innerText = 'Informações salvas';
        modified = false;
        page.sliderStartValue = page.slider.value;
        page.numberOfRemovals = 0;
    }

    changeNumberOfRemovals(action){
        if(action == '+'){
            this.numberOfRemovals++;
        } else {
            this.numberOfRemovals--;
        }
    }

    checkChangesToBeSaved(){
        if (this.slider.value != this.sliderStartValue || this.numberOfRemovals != 0) {
            this.setChangesToBeSaved();
        } else {
            this.setNoChanges();
        }
    }

}

function getSliderValue() {
    chrome.storage.sync.get(['whenReactInPercent'], function (result) {
        page.sliderStartValue = result.whenReactInPercent * 100;
        setSliderValue();
    });
}

function setSliderValue() {
    console.log(page.sliderStartValue);
    page.slider.value = page.sliderStartValue;
    page.whenReactText.innerHTML = page.slider.value + '%';
    page.slider.oninput = function () {
        page.whenReactText.innerText = page.slider.value + '%';
        page.checkChangesToBeSaved();
    }
}

function getListsValue() {
    chrome.storage.sync.get(null, (result) => {
        page.likeList = result.likeList;
        page.dislikeList = result.dislikeList;

        if (result.likeList !== undefined) page.likeSet = new Set(result.likeList);
        if (result.dislikeList !== undefined) page.dislikeSet = new Set(result.dislikeList);

        console.log('Lista de likes: ' + page.likeList);
        console.log('Lista de dislikes: ' + page.dislikeList);

        iterateListCreatingButtons(page.likeList, page.likeContent);
        iterateListCreatingButtons(page.dislikeList, page.dislikeContent);
    });
}

function iterateListCreatingButtons(list, contentBox) {
    const addSrc = '../imgs/add.png';
    const removeSrc = '../imgs/remove.png';
    if (list !== undefined) {
        for (let i = 0; i < list.length; i++) {
            let btn = document.createElement('div');
            btn.classList.add('btn');
            btn.innerHTML = '<p>' + list[i] + '</p><img src="' + removeSrc + '">';
            btn.onclick = function () {
                let icon = btn.querySelector('img');
                if (icon.src.endsWith(removeSrc.substr(2, removeSrc.length))) {
                    icon.src = addSrc;
                    page.changeNumberOfRemovals('+'); // incrementing a removal
                } else {
                    icon.src = removeSrc;
                    page.changeNumberOfRemovals('-'); // decrementing a removal
                }
                btn.classList.toggle('removed');
                page.checkChangesToBeSaved();
            }
            contentBox.append(btn);
        }
    }
}

function saveData() {
    if (modified && page.saveBtn.getAttribute('saved') == 'false') { // only make changes if there are changes
        chrome.storage.sync.set({ 'whenReactInPercent': page.slider.value/100}, function () { // first save when react
            changeChannelsSet();
            modified = false;
            page.setNoChanges();
        });
    }
}

function changeChannelsSet(){
    findRemovals(page.likeContent, page.likeSet, saveLikeSet);
    findRemovals(page.dislikeContent, page.dislikeSet, saveDislikeSet);
    
}
function findRemovals (content, set, save, action){
    let buttons = content.getElementsByClassName('btn');
    for (btn of buttons) {
        let icon = btn.getElementsByTagName('img')[0].src;
        if (icon.endsWith('add.png')) { // has removed
            let name = btn.getElementsByTagName('p')[0].innerHTML;
            if(set !== undefined) // posso tirar dps
                set.delete(name);
        }
    }
    console.log(set);
    save();
}

function saveLikeSet(){
    if (page.likeSet !== undefined) {
        var likeList = Array.from(page.likeSet);
        chrome.storage.sync.set({ "likeList": likeList }, function () {
            console.log('Lista de like salva como: ' + likeList);
            removeButtons(page.likeContent);
        });
    }
}

function saveDislikeSet() {
    if (page.dislikeSet !== undefined) {
        var dislikeList = Array.from(page.dislikeSet);
        chrome.storage.sync.set({ "dislikeList": dislikeList }, function () {
            console.log('Lista de dislike salva como: ' + dislikeList);
            removeButtons(page.dislikeContent);
        });
    }
}

function removeButtons(content){
    let buttons = content.getElementsByClassName('btn');
    for (btn of buttons) {
        let icon = btn.getElementsByTagName('img')[0].src;
        if (icon.endsWith('add.png')) { // has removed
            btn.parentNode.removeChild(btn);
        }
    }
}

let page = new Page();
getSliderValue();
getListsValue();
