(window.webpackJsonpmapboard=window.webpackJsonpmapboard||[]).push([[21],{441:function(t,e,s){"use strict";
/*!
 * escape-html
 * Copyright(c) 2012-2013 TJ Holowaychuk
 * Copyright(c) 2015 Andreas Lubbe
 * Copyright(c) 2015 Tiancheng "Timothy" Gu
 * MIT Licensed
 */var a=/["'&<>]/;t.exports=function(t){var e,s=""+t,n=a.exec(s);if(!n)return s;var r="",o=0,i=0;for(o=n.index;o<s.length;o++){switch(s.charCodeAt(o)){case 34:e="&quot;";break;case 38:e="&amp;";break;case 39:e="&#39;";break;case 60:e="&lt;";break;case 62:e="&gt;";break;default:continue}i!==o&&(r+=s.substring(i,o)),i=o+1,r+=e}return i!==o?r+s.substring(i,o):r}},463:function(t,e,s){"use strict";s.r(e);var a=s(25),n=s(165),r=s(441),o=s.n(r);const i=["principal","interest","penalty","other"];var l={mixins:[a.a],data(){return{parseData:{accountNum:this.$store.state.sources.tips.data.data.accountNum,totalDue:"",balances:this.$store.state.sources.tips.data.data,address:{streetAddress:this.$store.state.sources.tips.data.data.property.address,zipCode:this.$store.state.geocode.data.properties.zip_code}},xmlData:{},buttonStyle:"height: "+this.$props.options.height+"px;       width: "+this.$props.options.width+"px;       font-size: "+this.$props.options.fontSize+"px;       ",actionAddress:this.$props.options.actionAddress||"https://test-secure.phila.gov/PaymentCenter/Gateway1/InitiatePurchase.aspx"}},created(){this.parseData.totalDue=this.calculateTotalDue(),this.$store.commit("setPropertyBalance",this.parseData.totalDue),this.xmlData=function(t){if(console.log("generate billing xml",t),Object.keys(t).length<1)return"";let e=Object(n.format)(new Date,"YYYY-MM-DDTHH:mm:ssZ");const s=`<?xml version="1.0" encoding="utf-16"?>\n<BillingStatement xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\n  <ApplicationID>fcd68fd2-e923-4b03-a0e7-a678c2ed612a</ApplicationID>\n  <AccountNumber />\n  <BillNumber>${t.balances.accountNum}</BillNumber>\n  <StatementNumber />\n  <BillingDate>${e}</BillingDate>\n  <DueDate>${e}</DueDate>\n  <TotalDue>${t.totalDue}</TotalDue>\n  <DepartMentId>0</DepartMentId>\n  <Fund>0</Fund>\n  <PaymentDate>0001-01-01T00:00:00</PaymentDate>\n  <Quantity>0</Quantity>\n  <ItemAmount>0</ItemAmount>\n  <TotalAmountdue>0</TotalAmountdue>\n  <PartialPaymentFlag>false</PartialPaymentFlag>\n  <ReceiptpresentFlag>false</ReceiptpresentFlag>\n  <Details>\n    <BillingStatementDetail>\n      <ItemDate>${e}</ItemDate>\n      <ItemDescription>Real Estate Tax</ItemDescription>\n      <Charges>${t.totalDue}</Charges>\n      <Credits>0</Credits>\n    </BillingStatementDetail>\n  </Details>\n  <Customers>\n    <Customer>\n      <FirstName>${t.balances.property.ownerName}</FirstName>\n      <MiddleName />\n      <LastName />\n      <BillingAddress>\n        <Address>\n          <AddressLine1>${t.address.streetAddress}</AddressLine1>\n          <City>PHILADELPHIA</City>\n          <State>PA</State>\n          <PostalCode>${t.address.zipCode}</PostalCode>\n          <Country>US</Country>\n        </Address>\n      </BillingAddress>\n    </Customer>\n  </Customers>\n</BillingStatement>\n  `;return o()(s)}(this.parseData)},computed:{message(){if(this.$props.slots)return this.evaluateSlot(this.$props.slots.text)},class(){if(this.$props.options)return this.$props.options.class||""},style(){if(this.$props.options)return this.$props.options.style||""},shouldShowButton(){return this.parseData.totalDue>0}},methods:{calculateTotalDue(){return this.parseData.balances.years.reduce((t,e)=>{return t+this.calculateTotalForYear(e)},0)},calculateTotalForYear:t=>i.map(e=>t[e]).reduce((t,e)=>t+e,0)}},u=s(2),p=Object(u.a)(l,function(){var t=this.$createElement,e=this._self._c||t;return e("form",{attrs:{action:this.actionAddress,method:"post",target:"_blank"}},[e("input",{attrs:{name:"billStmt",type:"hidden"},domProps:{value:this.xmlData}}),this._v(" "),e("input",{directives:[{name:"show",rawName:"v-show",value:this.shouldShowButton,expression:"this.shouldShowButton"}],staticClass:"button external",style:this.buttonStyle,attrs:{type:"submit"},domProps:{value:this.$props.slots.text}})])},[],!1,null,"3c54944d",null);e.default=p.exports}}]);