<template>
  <div id="app">
    <h1 class="title">Передача файла исследования</h1>
    <file-uploader
      @submitFile="submitFile"
      v-show="reader && state === STATES.start.title"
      ref="fileUploader"
    />
    <div v-show="state !== STATES.start.title">
      <p class="statusText">{{ STATES[state].text }}</p>
      <div class="buttons">
        <a
          ref="downloadLink"
          class="downloadLink"
          v-show="state == STATES.finish.title"
        >
          Скачать данные
        </a>
        <button @click="clearData" v-show="state !== STATES.loading.title">
          Начать заново
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import FileUploader from './components/FileUploader.vue'

const STATES = {
  start: { title: 'start', text: '' },
  loading: {
    title: 'loading',
    text: 'Происходит магия, пожалуйста, подождите'
  },
  finish: {
    title: 'finish',
    text: 'Успех! Новые данные сформированы. Вы можете скачать их по ссылке ниже'
  },
  error: { title: 'error', text: 'Произошла ошибка. Попробуйте позже.' }
}
const BATCH_SIZE = 2048
const MUTABLE_STRING = /[A-Z]+\s[A-Z]\.[A-Z]\./gm

export default {
  name: 'app',
  components: {
    FileUploader
  },

  data() {
    return {
      STATES,
      state: STATES.start.title,
      loadStatus: 0,
      reader: null,
      fileName: ''
    }
  },
  mounted() {
    this.reader = new FileReader()

    this.reader.addEventListener('loadend', this.onReadedFile)
    this.reader.addEventListener('error', this.onError)
  },
  beforeDestroy() {
    this.reader.removeEventListener('loadend')
    this.reader.removeEventListener('error')
  },
  methods: {
    submitFile(file) {
      this.state = STATES.loading.title

      this.fileName = file.name
      this.reader.readAsArrayBuffer(file)

      file = null
    },

    onError(error) {
      console.error(error)
      this.state = STATES.error.title
    },
    onReadedFile() {
      const startTime = Date.now()

      const array = new Uint8Array(this.reader.result)
      const pureArray = this.anonimizeArray(array)
      this.saveArrayToFile(pureArray)

      this.state = STATES.finish.title
      console.log('total time: ', Date.now() - startTime)
    },

    anonimizeArray(array) {
      const changes = this.getChangesForArray(array)
      const pureArray = this.applyChangesToArray(array, changes)

      return pureArray
    },

    getChangesForArray(array) {
      const batchCount = Math.floor(array.length / BATCH_SIZE)
      const emptyArray = String(new Uint8Array(BATCH_SIZE))
      const changes = []

      for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
        const batch = new Uint8Array(
          array.buffer,
          batchIndex * BATCH_SIZE,
          batchIndex === batchCount - 1 ? undefined : BATCH_SIZE
        )

        if (String(batch) !== emptyArray) {
          const change = this.getChangeForBatch(batch, batchIndex)

          if (change) {
            changes.push(change)
          }
        }
      }

      return changes
    },

    getChangeForBatch(batch, batchIndex) {
      const originalString = String.fromCharCode.apply(null, batch)
      const pureString = this.anonimizeString(originalString)

      if (pureString !== originalString) {
        return {
          newData: Uint8Array.from(
            pureString.split('').map(x => x.charCodeAt())
          ),
          startIndex: batchIndex
        }
      }

      return null
    },

    anonimizeString(originalString) {
      let pureString = originalString

      const findedFIOIndex = [...originalString.matchAll(MUTABLE_STRING)]

      if (findedFIOIndex.length) {
        pureString = originalString.replaceAll(MUTABLE_STRING, match =>
          match.length > 14
            ? 'A'.repeat(match.length - 14) + 'ANONIMOUS A.A.'
            : 'ANONIMOUS A.A.'.substring(0, match.length)
        )
      }

      return pureString
    },

    applyChangesToArray(array, changes) {
      let pureArray = array

      changes.forEach(change => {
        change.newData.forEach((changedByte, byteId) => {
          pureArray[change.startIndex * BATCH_SIZE + byteId] = changedByte
        })
      })

      return pureArray
    },

    saveArrayToFile(array) {
      const link = this.$refs['downloadLink']
      const blob = new Blob([array], { type: 'text/plain' })

      link.href = URL.createObjectURL(blob)
      link.download = 'anon_' + this.fileName
    },

    clearData() {
      this.$refs['fileUploader'].$refs['fileSelector'].value = null
      this.state = STATES.start.title
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

.statusText {
  display: block;
  overflow: hidden;
  margin: 4px 0;
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
}

.buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;

  & > * {
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
}
</style>
