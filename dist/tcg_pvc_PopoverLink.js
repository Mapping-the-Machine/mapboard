(window.webpackJsonpmapboard=window.webpackJsonpmapboard||[]).push([[16],{417:function(e,o,t){var s=t(431);"string"==typeof s&&(s=[[e.i,s,""]]);var r={hmr:!0,transform:void 0,insertInto:void 0};t(5)(s,r);s.locals&&(e.exports=s.locals)},430:function(e,o,t){"use strict";var s=t(417);t.n(s).a},431:function(e,o,t){(e.exports=t(4)(!1)).push([e.i,"\n.popover-link {\n  border-bottom: 1px dotted;\n  font-weight: bold;\n  /* color: #444; */\n  color: #2176d2;\n}\n",""])},436:function(e,o,t){"use strict";t.r(o);var s={mixins:[t(25).a],props:["fieldLabel"],data:()=>({showFieldLabel:!1}),created(){window.addEventListener("resize",this.handleWindowResize),this.handleWindowResize()},computed:{value(){const e=this.$props.slots.value,o=this.$props.slots.transforms||[],t=this.$props.slots.nullValue||"";return this.evaluateSlot(e,o,t)},popoverValue(){const e=this.value,o=this.$props.slots.popoverTransforms||[],t=this.$props.slots.popoverNullValue||"";return this.evaluateSlot(e,o,t)},popoverPreText(){let e=this.$props.slots.popoverPreText||"";return this.evaluateSlot(e)},popoverPostText(){let e=this.$props.slots.popoverPostText||"";return this.evaluateSlot(e)},shouldShowValue(){return!1!==this.$props.slots.shouldShowValue},popoverText(){return!0===this.shouldShowValue?this.popoverPreText+" "+this.popoverValue+" "+this.popoverPostText:this.popoverPreText+" "+this.popoverPostText}},methods:{didClickPopoverLink(e){this.$store.commit("setPopoverOpen",!0),this.$store.commit("setPopoverText",this.popoverText)},handleWindowResize(){window.innerWidth>=750?this.showFieldLabel=!1:this.showFieldLabel=!0},evaluateFieldLabel(){return this.showFieldLabel?this.$props.fieldLabel+": ":""}}},r=(t(430),t(2)),l=Object(r.a)(s,function(){var e=this,o=e.$createElement,t=e._self._c||o;return t("div",[e._v("\n  "+e._s(e.evaluateFieldLabel())+"\n  "),t("a",{staticClass:"popover-link",attrs:{title:e.value+" "+e.popoverValue},on:{click:e.didClickPopoverLink}},[e._v("\n    "+e._s(e.value)+"\n  ")])])},[],!1,null,null,null);o.default=l.exports}}]);