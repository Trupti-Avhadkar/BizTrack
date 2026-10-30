const $ = id => document.getElementById(id);
const today = () => new Date().toISOString().slice(0,10);
const currency = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(Number(n)||0);
const prettyDate = s => s ? new Date(s+'T12:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const sample = {
 products:[
 {id:'p1',name:'Premium Notebook',category:'Stationery',price:85,stock:18},
 {id:'p2',name:'Blue Ball Pen',category:'Stationery',price:15,stock:4},
 {id:'p3',name:'Desk Organizer',category:'Office',price:249,stock:9},
 {id:'p4',name:'Reusable Water Bottle',category:'Lifestyle',price:199,stock:3},
 {id:'p5',name:'Sticky Notes Set',category:'Stationery',price:65,stock:24}
 ],
 sales:[
 {id:'s1',productId:'p1',productName:'Premium Notebook',qty:2,price:85,total:170,date:today()},
 {id:'s2',productId:'p3',productName:'Desk Organizer',qty:1,price:249,total:249,date:today()},
 {id:'s3',productId:'p2',productName:'Blue Ball Pen',qty:3,price:15,total:45,date:today()}
 ],
 expenses:[
 {id:'e1',name:'Shop electricity',category:'Utilities',amount:650,date:today()},
 {id:'e2',name:'Packaging supplies',category:'Supplies',amount:320,date:today()}
 ]
};
let state;
try { state = JSON.parse(localStorage.getItem('biztrack_data_v1')) || structuredClone(sample); } catch { state = structuredClone(sample); }
function save(){localStorage.setItem('biztrack_data_v1',JSON.stringify(state));render();}
function toast(message,error=false){const el=$('toast');el.textContent=message;el.className='toast show'+(error?' error':'');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.className='toast',2600);}
function totalSales(){return state.sales.reduce((s,x)=>s+Number(x.total),0)}
function totalExpenses(){return state.expenses.reduce((s,x)=>s+Number(x.amount),0)}
function netProfit(){return totalSales()-totalExpenses()}
function empty(msg,sub=''){return `<div class="empty-state"><b>${msg}</b>${sub}</div>`}
function avatar(text){return (text||'?').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()}
function go(page){document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===page));window.scrollTo({top:0,behavior:'smooth'});if(page==='sales')updateSalePrice();}
function renderHome(){
 $('totalSales').textContent=currency(totalSales());$('totalExpenses').textContent=currency(totalExpenses());$('netProfit').textContent=currency(netProfit());$('stockCount').textContent=state.products.reduce((a,p)=>a+Number(p.stock),0);$('productCount').textContent=`${state.products.length} products`;$('salesCount').textContent=`${state.sales.length} transactions`;$('expenseCount').textContent=`${state.expenses.length} entries`;
 const low=state.products.filter(p=>p.stock<=5);
 $('lowStockList').innerHTML=low.length?low.map(p=>`<div class="list-row"><div class="item-avatar">${avatar(p.name)}</div><div class="item-main"><b>${esc(p.name)}</b><small>${esc(p.category)}</small></div><span class="stock-warning">${p.stock} left</span></div>`).join(''):empty('Stock levels look good','No products at or below 5 units.');
 const recent=[...state.sales.map(s=>({...s,type:'sale',label:s.productName,amount:s.total})),...state.expenses.map(e=>({...e,type:'expense',label:e.name,amount:e.amount}))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
 $('recentList').innerHTML=recent.length?recent.map(t=>`<div class="list-row"><div class="item-avatar">${t.type==='sale'?'↗':'−'}</div><div class="item-main"><b>${esc(t.label)}</b><small>${t.type==='sale'?'Sale':'Expense'} · ${prettyDate(t.date)}</small></div><div class="item-end"><b style="color:${t.type==='sale'?'#14835f':'#c66c30'}">${t.type==='sale'?'+':'−'}${currency(t.amount)}</b></div></div>`).join(''):empty('No transactions yet','Your activity will appear here.');
}
function renderProducts(){
 const q=$('productSearch').value.trim().toLowerCase(), arr=state.products.filter(p=>(p.name+' '+p.category).toLowerCase().includes(q));
 $('productTotal').textContent=`${state.products.length} items`;
 $('productsList').innerHTML=arr.length?arr.map(p=>`<div class="data-row"><div class="item-avatar">${avatar(p.name)}</div><div class="item-main"><b>${esc(p.name)}</b><small>${esc(p.category)} · ${p.stock} in stock</small></div><div class="item-end"><b>${currency(p.price)}</b><small>${p.stock<=5?'<span style="color:#b97706">Low stock</span>':'In stock'}</small></div><div class="row-actions"><button class="mini-btn" data-edit-product="${p.id}">Edit</button><button class="mini-btn delete" data-delete-product="${p.id}">Delete</button></div></div>`).join(''):empty('No products found','Add a product or try another search.');
 $('saleProduct').innerHTML=state.products.length?state.products.map(p=>`<option value="${p.id}">${esc(p.name)} — ${p.stock} in stock</option>`).join(''):'<option value="">Add a product first</option>';
 updateSalePrice();
}
function renderSales(){
 $('salesHistoryCount').textContent=`${state.sales.length} sales`;
 const list=[...state.sales].sort((a,b)=>b.date.localeCompare(a.date));
 $('salesList').innerHTML=list.length?list.map(s=>`<div class="data-row"><div class="item-avatar">↗</div><div class="item-main"><b>${esc(s.productName)}</b><small>${s.qty} × ${currency(s.price)} · ${prettyDate(s.date)}</small></div><div class="item-end"><b style="color:#14835f">${currency(s.total)}</b><small>Sale</small></div><div class="row-actions"><button class="mini-btn delete" data-delete-sale="${s.id}">Delete</button></div></div>`).join(''):empty('No sales recorded','Record your first sale above.');
}
function renderExpenses(){
 $('expenseHistoryCount').textContent=`${state.expenses.length} expenses`;
 const list=[...state.expenses].sort((a,b)=>b.date.localeCompare(a.date));
 $('expensesList').innerHTML=list.length?list.map(e=>`<div class="data-row"><div class="item-avatar">−</div><div class="item-main"><b>${esc(e.name)}</b><small>${esc(e.category)} · ${prettyDate(e.date)}</small></div><div class="item-end"><b style="color:#c66c30">${currency(e.amount)}</b><small>Expense</small></div><div class="row-actions"><button class="mini-btn delete" data-delete-expense="${e.id}">Delete</button></div></div>`).join(''):empty('No expenses recorded','Add an expense above.');
}
function renderReports(){
 $('reportSales').textContent=currency(totalSales());$('reportExpenses').textContent=currency(totalExpenses());$('reportProfit').textContent=currency(netProfit());
 const max=Math.max(totalSales(),totalExpenses(),1);
 $('comparisonChart').innerHTML=[['Sales',totalSales(),'sales'],['Expenses',totalExpenses(),'expenses']].map(([label,value,cls])=>`<div class="bar-group"><div class="bar ${cls}" style="height:${Math.max(4,value/max*100)}%"><span class="bar-label">${label}<br>${currency(value)}</span></div></div>`).join('');
 const byProduct={};state.sales.forEach(s=>byProduct[s.productName]=(byProduct[s.productName]||0)+s.total);
 const rows=Object.entries(byProduct).sort((a,b)=>b[1]-a[1]).slice(0,6), top=Math.max(...rows.map(r=>r[1]),1);
 $('productChart').innerHTML=rows.length?rows.map(([name,val])=>`<div class="hbar-row"><span class="hbar-name" title="${esc(name)}">${esc(name)}</span><div class="hbar-track"><div class="hbar-fill" style="width:${val/top*100}%"></div></div><span class="hbar-value">${currency(val)}</span></div>`).join(''):empty('No sales data yet','Record a sale to see product performance.');
}
function render(){renderHome();renderProducts();renderSales();renderExpenses();renderReports();$('todayLabel').textContent=new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function openProduct(p=null){$('productForm').reset();$('productId').value=p?.id||'';$('productDialogTitle').textContent=p?'Edit product':'Add product';$('productName').value=p?.name||'';$('productCategory').value=p?.category||'';$('productPrice').value=p?.price??'';$('productStock').value=p?.stock??'';$('productDialog').showModal();}
$('addProductBtn').addEventListener('click',()=>openProduct());
$('productForm').addEventListener('submit',e=>{e.preventDefault();const id=$('productId').value,name=$('productName').value.trim(),category=$('productCategory').value.trim(),price=Number($('productPrice').value),stock=Number($('productStock').value);if(!name||!category||!Number.isFinite(price)||price<0||!Number.isInteger(stock)||stock<0){toast('Check product details and try again.',true);return}const p={id:id||uid(),name,category,price,stock};if(id){state.products=state.products.map(x=>x.id===id?p:x)}else state.products.push(p);$('productDialog').close();save();toast(id?'Product updated.':'Product added.');});
document.addEventListener('click',e=>{
 const goBtn=e.target.closest('[data-go]');if(goBtn)go(goBtn.dataset.go);
 const nav=e.target.closest('[data-page]');if(nav)go(nav.dataset.page);
 const close=e.target.closest('[data-close]');if(close)$(close.dataset.close).close();
 const edit=e.target.closest('[data-edit-product]');if(edit){const p=state.products.find(x=>x.id===edit.dataset.editProduct);if(p)openProduct(p)}
 const del=e.target.closest('[data-delete-product]');if(del){const p=state.products.find(x=>x.id===del.dataset.deleteProduct);if(!p)return;if(state.sales.some(s=>s.productId===p.id)){toast('This product has sales history; keep it to preserve records.',true);return}if(confirm(`Delete "${p.name}"?`)){state.products=state.products.filter(x=>x.id!==p.id);save();toast('Product deleted.');}}
 const ds=e.target.closest('[data-delete-sale]');if(ds){if(confirm('Delete this sale? Stock will be restored.')){const s=state.sales.find(x=>x.id===ds.dataset.deleteSale);if(s){const p=state.products.find(x=>x.id===s.productId);if(p)p.stock+=s.qty;state.sales=state.sales.filter(x=>x.id!==s.id);save();toast('Sale deleted and stock restored.')}}}
 const de=e.target.closest('[data-delete-expense]');if(de&&confirm('Delete this expense?')){state.expenses=state.expenses.filter(x=>x.id!==de.dataset.deleteExpense);save();toast('Expense deleted.')}
});
$('productSearch').addEventListener('input',renderProducts);
function updateSalePrice(){const p=state.products.find(x=>x.id===$('saleProduct').value);if(p&&!$('salePrice').dataset.edited)$('salePrice').value=p.price;const qty=Math.max(0,Number($('saleQty').value)||0),price=Math.max(0,Number($('salePrice').value)||0);$('salePreview').textContent=currency(qty*price)}
$('saleProduct').addEventListener('change',()=>{$('salePrice').dataset.edited='';updateSalePrice()});$('saleQty').addEventListener('input',updateSalePrice);$('salePrice').addEventListener('input',()=>{$('salePrice').dataset.edited='1';updateSalePrice()});
$('saleForm').addEventListener('submit',e=>{e.preventDefault();const p=state.products.find(x=>x.id===$('saleProduct').value),qty=Number($('saleQty').value),price=Number($('salePrice').value);if(!p){toast('Add a product before recording a sale.',true);return}if(!Number.isInteger(qty)||qty<1||qty>p.stock){toast(`Insufficient stock. Available: ${p.stock}.`,true);return}if(!Number.isFinite(price)||price<0){toast('Enter a valid unit price.',true);return}state.sales.push({id:uid(),productId:p.id,productName:p.name,qty,price,total:qty*price,date:today()});p.stock-=qty;save();$('saleQty').value=1;$('salePrice').dataset.edited='';updateSalePrice();toast('Sale saved and stock updated.');});
$('expenseDate').value=today();
$('expenseForm').addEventListener('submit',e=>{e.preventDefault();const name=$('expenseName').value.trim(),category=$('expenseCategory').value,amount=Number($('expenseAmount').value),date=$('expenseDate').value;if(!name||!date||!Number.isFinite(amount)||amount<=0){toast('Enter valid expense details.',true);return}state.expenses.push({id:uid(),name,category,amount,date});save();$('expenseForm').reset();$('expenseDate').value=today();toast('Expense saved.');});
function csvCell(v){return '"'+String(v??'').replace(/"/g,'""')+'"'}
function downloadCSV(name,headers,rows){const csv=[headers,...rows].map(r=>r.map(csvCell).join(',')).join('\r\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
function exportAll(){downloadCSV('biztrack_records.csv',['Record type','Date','Name / Product','Category','Quantity','Unit price (INR)','Amount (INR)'],[
 ...state.sales.map(s=>['Sale',s.date,s.productName,'',s.qty,s.price,s.total]),
 ...state.expenses.map(e=>['Expense',e.date,e.name,e.category,'','',e.amount]),
 ...state.products.map(p=>['Product','',p.name,p.category,p.stock,p.price,''])
]);toast('CSV export started.');}
$('exportBtn').addEventListener('click',exportAll);$('exportTop').addEventListener('click',exportAll);
$('resetDemoBtn').addEventListener('click',()=>{if(confirm('This permanently clears your BizTrack records from this browser. Continue?')){state={products:[],sales:[],expenses:[]};save();toast('All app data reset.');}});
if('serviceWorker' in navigator && location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
