<template>
  <div>
    <form action="" id="loginForm">
        <h1>Передача файла исследования</h1>
        <div id="file-uploader" v-show="state === STATES[0]">
            <div class="form-group file-area">
                <label for="file" style="display: none;">Файл <span >Пожалуйста, выберите файл</span></label>
                <input type="file" name="file" required="required" id="file-selector" accept=".iso"/>
                <div class="file-dummy">
                    <div class="success">Файл выбран. Пожалуйста, нажмите на кнопку ниже.</div>
                    <div class="default">Перетащите файл в эту зону, либо нажмите для выбора.</div>
                </div>
            </div>

            <div class="form-group">
            <button type="submit" @click="(event) => submitForm(event)">Изменить файл</button>
            </div>
        </div>
        <div class="loader form-group" id="loader" v-show="state === STATES[1]">
            <label>Происходит магия, пожалуйста, подождите</label>
        </div>
        <div class="form-group" id="success" v-show="state === STATES[2]">
            <label style="margin-bottom: 30px;">Успех! Новые данные сформированы. Вы можете скачать их по ссылке ниже</label>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <a id="downloadLink">Скачать данные</a>
                <button onclick="start()">Начать заново</button>
            </div>
        </div>
        
    </form> 
  </div>
</template>

<script>
const STATES = ['start', 'loading', 'finish']
export default {
  name: "app",

  data() {
    return {
      STATES,
      state: STATES[0],
      loadStatus: 0,
    }
  },
  methods: {
    start() {
      document.getElementById('file-selector').files = []
      this.state = STATES[0]
    },
    submitForm(event) {
      this.state = STATES[1]
      event.preventDefault();
      const changeState = this.changeState
      let startTime = Date.now();

      const link = document.getElementById('downloadLink');

      let reader = new FileReader();
      let file = document.getElementById('file-selector').files[0]
      const fileName = file.name
      reader.readAsArrayBuffer(file);
      file = null;
      reader.onload = function() {
          let array = new Uint8Array(reader.result)
          let i = 0;
          const length = array.length
          const emptyArray = String(new Uint8Array(2048))
          const changes = []
          while(i < Math.floor(length/2048)) {
              const partOfArray = new Uint8Array(array.buffer, i*2048, 2048)
              
              if (String(partOfArray) !== emptyArray) {
                const originalString = String.fromCharCode.apply(null, partOfArray)

                const findedFIOIndex = [...originalString.matchAll(/[A-Z]+\s[A-Z]\.[A-Z]\./gm)]
                if (findedFIOIndex.length){
                  const replacedString = originalString.replaceAll(/[A-Z]+\s[A-Z]\.[A-Z]\./gm, (match) => {
                    return (match.length>14) ? 'A'.repeat(match.length-14)+'ANONIMOUS A.A.' : 'ANONIMOUS A.A.'.substring(0, match.length);
                  })
                  const replacedPart = Uint8Array.from(replacedString.split("").map(x => x.charCodeAt()));
                  changes.push({
                    newData: replacedPart,
                    startIndex: i,
                  })
                }
              }
              i++
          }

          changes.forEach((change)=>{
            change.newData.forEach((changedByte, byteId)=> {
              array[change.startIndex*2048 + byteId] = changedByte
            })
          })

          console.log('total: ', Date.now() -startTime )


          //// -------------------- Saving to file ----------------------
          const blob = new Blob( [ array ], { type: 'text/plain' } );	
          const objectURL = URL.createObjectURL( blob );
          
          link.href = objectURL;
          link.href = URL.createObjectURL( blob );
          link.download = 'anon_'+ fileName;
          changeState(STATES[2])
      };
    
      reader.onerror = function() {
        console.log(reader.error);
        alert('Error! Check logs in console')
        changeState(STATES[0])
      };
    },
    changeState(newState) {
      this.state = newState
    },
  }
};
</script>

<style>
/* ===================== FILE INPUT ===================== */
.file-area {
  width: 100%;
  position: relative;
}
.file-area input[type=file] {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  cursor: pointer;
}
.file-area .file-dummy {
  width: 100%;
  padding: 30px;
  background: #fff;
  text-align: center;
  transition: background 0.3s ease-in-out;
}
.file-area .file-dummy .success {
  display: none;
}
.file-area:hover .file-dummy {
  background: #e6e6e6
}

.file-area input[type=file]:valid + .file-dummy {
  border-color: var(--bg-color-1);
  background-color: #fff;
}
.file-area input[type=file]:valid + .file-dummy .success {
  display: inline-block;
}
.file-area input[type=file]:valid + .file-dummy .default {
  display: none;
}

/* ===================== BASIC STYLING ===================== */
* {
  box-sizing: border-box;
  font-family: 'Lato', sans-serif;
}
*:focus {
  outline: none;
}
:root {
  --bg-color-1: #c6a8ff;
  --bg-color-2: #1c0052;
}
html, body {
  margin: 0;
  padding: 0;
  font-weight: 300;
  height: 100%;
  background: #e2e2e2;
  color: #3C3C3C;
  font-size: 16px;
  overflow: hidden;
 
}
h1 {
  text-align: center;
  margin: 50px auto;
  font-weight: 500;
}
label {
  font-weight: 500;
  display: block;
  margin: 4px 0;
  text-transform: uppercase;
  font-size: 13px;
  overflow: hidden;
}
label span {
  float: right;
  text-transform: none;
  font-weight: 200;
  line-height: 1em;
  font-style: italic;
  opacity: 0.8;
}
.form-controll {
  display: block;
  padding: 8px 16px;
  width: 100%;
  font-size: 16px;
  background-color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-weight: 200;
}
.form-controll:focus {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline: -webkit-focus-ring-color auto 5px;
}
button, #downloadLink {
  padding: 8px 30px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
  color: var(--bg-color-2);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 11px;
  border: 0;
  text-shadow: 0 1px 2px #fff;
  cursor: pointer;
  text-decoration: none;
}
button:hover,
#downloadLink:hover {
  background: rgba(255, 255, 255, 0.6);
}
.form-group {
  max-width: 500px;
  margin: auto;
  margin-bottom: 30px;
}
.back-to-article {
  color: #fff;
  text-transform: uppercase;
  font-size: 12px;
  position: absolute;
  right: 20px;
  top: 20px;
  text-decoration: none;
  display: inline-block;
  background: rgba(0, 0, 0, 0.6);
  padding: 10px 18px;
  transition: all 0.3s ease-in-out;
  opacity: 0.6;
}
.back-to-article:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.8);
}
</style>