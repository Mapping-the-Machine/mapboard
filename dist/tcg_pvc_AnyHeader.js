(window.webpackJsonpmapboard=window.webpackJsonpmapboard||[]).push([[3],{477:function(s,e,t){"use strict";t.r(e);var i={name:"AnyHeader",mixins:[t(25).a],computed:{headerType(){return this.$props.options.headerType},additionalTags(){return this.$props.slots.additionalTags||[]},message(){let s="";for(let e of this.additionalTags)s=s+"<"+e+">";s+=this.evaluateSlot(this.$props.slots.text,this.$props.slots.transforms);for(let e of this.additionalTags)s=s+"</"+e+">";return s},style(){if(this.$props.options)return this.$props.options.style||""}}},h=t(2),r=Object(h.a)(i,function(){var s=this,e=s.$createElement,t=s._self._c||e;return t("div",["h1"===this.headerType?t("h1",{style:this.style,domProps:{innerHTML:s._s(this.message)}}):s._e(),s._v(" "),"h2"===this.headerType?t("h2",{style:this.style,domProps:{innerHTML:s._s(this.message)}}):s._e(),s._v(" "),"h3"===this.headerType?t("h3",{style:this.style,domProps:{innerHTML:s._s(this.message)}}):s._e(),s._v(" "),"h4"===this.headerType?t("h4",{style:this.style,domProps:{innerHTML:s._s(this.message)}}):s._e(),s._v(" "),"h5"===this.headerType?t("h5",{style:this.style,domProps:{innerHTML:s._s(this.message)}}):s._e(),s._v(" "),"h6"===this.headerType?t("h6",{style:this.style,domProps:{innerHTML:s._s(this.message)}}):s._e()])},[],!1,null,"4cad7d8b",null);e.default=r.exports}}]);