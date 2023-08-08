<template>
  <div id="app">
    <h1 class="title">Передача файла исследования</h1>
    <file-uploader @submitFile="submitFile" v-show="state === STATES[0]" />

    <div class="loadingTemplate" v-show="state === STATES[1]">
      <label>Происходит магия, пожалуйста, подождите</label>
    </div>

    <div id="resultTemplate" v-show="state === STATES[3]">
      <label>
        Успех! Новые данные сформированы. Вы можете скачать их по ссылке ниже
      </label>
      <div class="buttons">
        <a id="download-link">Скачать данные</a>
        <button @click="clearData">Начать заново</button>
      </div>
    </div>

    <div id="errorTemplate" v-show="state === STATES[4]">
      <label> Произошла ошибка. Попробуйте позже. </label>
      <button @click="clearData">Начать заново</button>
    </div>
  </div>
</template>

<script>
import FileUploader from './components/FileUploader.vue'
const STATES = ['start', 'loading', 'finish', 'error']
const batchSize = 2048

export default {
  name: 'app',
  components: {
    FileUploader
  },

  data() {
    return {
      STATES,
      state: STATES[0],
      loadStatus: 0
    }
  },
  methods: {
    clearData() {
      document.getElementById('file-selector').value = null
      this.state = STATES[0]
    },
    submitFile(file) {
      this.state = STATES[1]

      const startTime = Date.now() // for checking processing time
      const link = document.getElementById('download-link')
      const changeState = this.changeState
      const reader = new FileReader()
      const fileName = file.name
      reader.readAsArrayBuffer(file)
      file = null

      reader.onload = function () {
        let array = new Uint8Array(reader.result)
        const batchCount = Math.floor(array.length / batchSize)
        const emptyArray = String(new Uint8Array(batchSize))
        const changes = []

        for (let i = 0; i < batchCount; i++) {
          const batch = new Uint8Array(
            array.buffer,
            i * batchSize,
            i === batchCount - 1 ? undefined : batchSize
          )
          // skip empty batches for optimization
          if (String(batch) !== emptyArray) {
            const originalString = String.fromCharCode.apply(null, batch)

            const findedFIOIndex = [
              ...originalString.matchAll(/[A-Z]+\s[A-Z]\.[A-Z]\./gm)
            ]

            if (findedFIOIndex.length) {
              const replacedString = originalString.replaceAll(
                /[A-Z]+\s[A-Z]\.[A-Z]\./gm,
                match =>
                  match.length > 14
                    ? 'A'.repeat(match.length - 14) + 'ANONIMOUS A.A.'
                    : 'ANONIMOUS A.A.'.substring(0, match.length)
              )
              const replacedPart = Uint8Array.from(
                replacedString.split('').map(x => x.charCodeAt())
              )

              changes.push({
                newData: replacedPart,
                startIndex: i
              })
            }
          }
        }

        changes.forEach(change => {
          change.newData.forEach((changedByte, byteId) => {
            array[change.startIndex * batchSize + byteId] = changedByte
          })
        })

        //// -------------------- Create url for saving to file ----------------------
        const blob = new Blob([array], { type: 'text/plain' })

        link.href = URL.createObjectURL(blob)
        link.download = 'anon_' + fileName
        changeState(STATES[2])

        // eslint-disable-next-line no-console
        console.log('total time: ', Date.now() - startTime)
      }

      reader.onerror = function () {
        // eslint-disable-next-line no-console
        console.error(reader.error)
        changeState(STATES[4])
      }
    },
    changeState(newState) {
      this.state = newState
    }
  }
}
</script>

<style lang="scss">
html,
body {
  overflow: hidden;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  background-color: #e2e2e2;
  font-size: 16px;
  font-family: Lato, sans-serif;
  font-weight: 300;
  color: #3c3c3c;

  *:focus {
    outline: none;
  }
}

#app {
  max-width: 500px;
  margin: auto;
}

.title {
  text-align: center;
  margin: 50px auto;
  font-weight: 500;
}

label {
  display: block;
  overflow: hidden;
  margin: 4px 0;
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
}

input,
button {
  cursor: pointer;
}

button,
#download-link {
  margin-top: 30px;
  padding: 8px 30px;
  border: 0;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.8);
  cursor: pointer;

  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  text-decoration: none;
  color: black;

  &:hover {
    background-color: rgba(255, 255, 255, 0.6);
  }
}

.buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
