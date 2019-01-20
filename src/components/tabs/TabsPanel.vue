<template>
    <div class="tabs">
        <tab-button name="General" :index="0"></tab-button>
        <tab-button name="Test" :index="1"></tab-button>
        <tab-button name="Online" :index="2">(0)</tab-button>
        <div style="float: right;" id="minimization-triangle"></div>

    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import TabButton from './TabButton.vue';

@Component({
  components: {
  TabButton
  }
  })
export default class Message extends Vue {}
</script>


<style lang="scss" scoped>
.tabs {
    padding: .4em .5em;
    position: relative;
    height: 25px;
    margin: 0px;
    padding: 0px;

}
</style>
