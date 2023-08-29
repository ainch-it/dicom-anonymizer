<template>
  <div class="fileUploader">
    <div class="fileUploader__uploadArea">
      <input
        class="fileUploader__input"
        type="file"
        name="file"
        required="required"
        id="fileSelector"
        ref="fileSelector"
        accept=".iso"
      />
      <div class="fileUploader__description">
        <div class="fileUploader__description-default">
          Перетащите файл в эту зону, либо нажмите для выбора.
        </div>
        <div class="fileUploader__description-success">
          Файл выбран. Пожалуйста, нажмите на кнопку ниже.
        </div>
      </div>
    </div>
    <div class="buttons">
      <button class="submitButton" @click="event => submitForm(event)">
        Изменить файл
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileUploader',
  methods: {
    submitForm(event) {
      event.preventDefault()
      let file = this.$refs['fileSelector'].files[0]
      if (file) {
        this.$emit('submitFile', file)
      }
    }
  }
}
</script>

<style lang="scss">
.fileUploader {
  $root: &;

  &__uploadArea {
    position: relative;
    width: 100%;

    #{$root}__input {
      position: absolute;
      inset: 0;
      opacity: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;

      &:valid + #{$root}__description {
        #{$root}__description-success {
          display: inline-block;
        }
        #{$root}__description-default {
          display: none;
        }
      }
    }

    #{$root}__description {
      transition: background-color 0.3s ease-in-out;
      box-sizing: border-box;
      width: 100%;
      padding: 30px;
      background-color: #fff;
      text-align: center;

      &-success {
        display: none;
      }
    }

    &:hover #{$root}__description {
      background-color: #e6e6e6;
    }
  }
}
</style>
