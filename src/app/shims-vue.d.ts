declare module '*.vue' {
  import Vue from 'vue';

  export default Vue;
}

// TS wasn't recognizing attempts to declare these in their own files
declare module 'vue-resize-directive';
declare module '@cloudcmd/clipboard';
declare class clipboard {
  writeText(value:string): void;
}
declare module 'sjcl';
