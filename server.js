"use strict"
/* Serveur pour le site */
var express = require('express');
var mustache = require('mustache-express');
const pdfkit=require('pdfkit')
const fs=require('fs')
const pdfdocument=new pdfkit



var model = require('./model');
var app = express();
var https = require('http').Server('app')

app.use(express.static((__dirname + '/public')));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: false
}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  secret: 'mot-de-passe-du-cookie'
}));

/* 3.2 */
function is_authenticated(req, res, next) {
  if (req.session.user !== undefined) {
    return next();
  }
  res.status(401).send('Authentication required');
}

/* 3.3 */
app.use(function (req, res, next) {
  if (req.session.user !== undefined) {
    res.locals.authenticated = true;
    res.locals.name = req.session.name;
  }
  return next();
});

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');

// Routes 
app.get('/', (req, res) => {
  res.render('main');
});

app.get('/login', (req, res) => {
  res.render('login-page');
});

app.get('/donneur', (req, res) => {
  res.render('donneursignup');
});
app.get('/quiestce', (req, res) => {
  res.render('quiestce');
});
app.get('/registercentre', (req, res) => {

  res.render('centre',{"loop" :model.listCentres()});
});
app.post('/signup', (req, res) => {
  var result = model.nouveauDonneur(signup_donneur(req));
  console.log(result)
  if (result === -1 ){
    res.redirect('/donneur')
  }
  else {
    res.redirect('/');
  }
});

app.post('/signupcentre', (req, res) => {

  console.log(model.nouveauAdminCentreWithattente(signup_admin_centre(req)));
  
  res.redirect('/');
});



app.get('/registeradmin', (req, res) => {

  res.render('admin');
});

app.post('/registeradmin',(req,res)=>{


console.log(model.NewAdminWithattente(signupadmin(req)));

res.redirect('/');
})

app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});


app.post('/login', (req, res) => {
 

  var login_result = model.login(req.body.mail, req.body.password);
  if (login_result == -1) {
    res.redirect('/login');
  }
    else {
      req.session.user = login_result;
      req.session.name = req.body.mail;
      var role=model.searchRoleUser(req.body.mail);
     
      
      if(role==1)res.redirect('/mainAdmincentre');
      if(role==2)res.redirect('/maindonneur');
      if(role==0)res.redirect('/mainadmin')
      else res.redirect('/');
    }
})

app.get('/mainAdmincentre',(req,res)=>{
if(req.session.user === undefined  ){
res.redirect('/');
}
else {res.render('mainadmincentre');

}
})
app.get('/maindonneur',(req,res)=>{

if(req.session.user === undefined  ){
res.redirect('/');
}
else {res.render('maindonneur');}

})
app.get('/modifierevenement',(req,res)=>{
if(req.session.user === undefined){
res.redirect('/');
}
else res.render('modifierevent',{"loop" :model.SelectEventWithUserId(req.session.user)})

})

app.post('/modifierevenement',(req,res)=>{

req.session.name= model.SelectEventWithname(req.body.s).id;
res.render('updateevent', model.SelectEventWithname(req.body.s));

})
app.post('/updateEvent',(req,res)=>{

model.UpdateEvent(req);
res.redirect('/evenement')

})



app.get('/evenement',(req,res)=>{
if(req.session.user === undefined){
res.redirect('/');
}
else
res.render('evenements');
});


app.get('/ajoutevenement',(req,res)=>{
if(req.session.user === undefined){
res.redirect('/');
}
else res.render('ajoutevenement')

})
app.get('/supprimerEvent',(req,res)=>{
if(req.session.user === undefined){
res.redirect('/');
}
else res.render('supprimerevenement',{"loop" :model.SelectEventWithUserId(req.session.user)});

})
app.post('/supprimerEvent',(req,res)=>{
model.SupprimerEvent(req);
res.redirect('/evenement')
})

app.get('/eventTocome',(req,res)=>{
if(req.session.user === undefined){
res.redirect('/');
}
else {res.render('eventTocome',{"loop" :model.EventToCome(req.session.user)});}
})

app.post('/ajoutevenement',(req,res)=>{
var id=model.newevenement(signup_newevent(req));
res.redirect('mainadmincentre');
})

app.get('/historiqueEvent',(req,res)=>{
if(req.session.user === undefined){
res.redirect('/');
}
else res.render('eventTocome',{"loop" :model.HistoriqueEvent(req.session.user)});
})
app.get('/profiladmincentre',(req,res)=>{
 res.render('profiladmincentre', model.ListInfoUser(req.session.user))
})

app.get('/SupprimerAdminCentre',(req,res)=>{
model.DeleteUser(req.session.user);
req.session = null;
res.redirect('/');
})
app.get('/updateprofil',(req,res)=>{
 res.render('updateprofil', model.ListInfoUser(req.session.user))
})
app.post('/updateprofil',(req,res)=>{
model.UpdateAdmincentre(Updateadmincenre(req));
res.redirect('/profiladmincentre');
})

app.get("/chercherdonneur",(req,res)=>{
res.render('recherchedonneur')
})
app.post("/chercherdonneur",(req,res)=>{
console.log(model.searchcodepostal(req.session.user))
console.log("salut")
var codepostal=model.searchcodepostal(req.session.user)
console.log(codepostal)
var list=model.searchdonneur(searchdonneur(req,codepostal));
res.render('resultatdonneur',{"loop" :list})
})


app.get('/oudonner',(req,res)=>{


res.render('oudonnermonsang',{"loop" :diviserpardeux(model.getCentrecloseofdonneur(req.session.user))})

})

app.get('/collecteavenir',(req,res)=>{
console.log(model.searchEventWithCodePostal(req.session.user));

res.render('eventfordonneur',{"loop" :diviserpardeux(model.searchEventWithCodePostal(req.session.user))})
})

app.get('/rendezvousdonneur',(req,res)=>{

res.render('prendreRendezvous',{"loop" :model.getCentrecloseofdonneur(req.session.user)})
})
app.post('/rendezvousdonneur',(req,res)=>{

var idCentre=model.searchcentre(req.body.centre);
var centre=model.searchcentreWithid(idCentre.id);

var info={
nom:req.body.centre,
date:req.body.date,
heureOuverture:ChangeFormatHour(centre.heureOuverture),
heureFermeture:ChangeFormatHour(centre.heureFermeture),
}

res.render('prendrerendezvous2.html',info)
})
app.post('/rendezvousdonneur2',(req,res)=>{
console.log(req.body.nom)
var idcentre=model.searchcentre(req.body.nom);
var DateR=req.body.date +" "+req.body.time; 
var ladate=new Date();
var info={
idCentre:idcentre.id,
idDonneur:req.session.user,
date:DateR
}
const pdfdocument=new pdfkit
//ecrire dans le pdf
pdfdocument.pipe(fs.createWriteStream("output.pdf"))
pdfdocument.fontSize(30).text("Prise de rendez-vous",200,100).text("pour don de sang").fontSize(20).text(" ").text(" ").text("Centre: "+req.body.nom,{top:"100px"} ).text(" ").text("date: "+req.body.date ).text(" ").text("Heure :"+req.body.time ).text(" ").text(" ").text(" ").text("le"+ladate.getDate()+"/"+(ladate.getMonth()+1)+"/"+ladate.getFullYear(),{align:'right'});

pdfdocument.image('cachet.png',{
fit:[100,100],

},600,900)
pdfdocument.end()
//fini
//insérer dans la base de données 



res.render('prendrerendezvous3');
var rendezvous=model.nouveaurendezvous(info)
})
app.get('/download',function (req,res){
res.download('output.pdf','output.pdf')


})

app.get('/profildonneur',(req,res)=>{

res.render('profildonneur', model.ListInfoUser(req.session.user))
})

app.get('/updateprofidonneur',(req,res)=>{
res.render('updateprofildonneur', model.ListInfoUser(req.session.user))
})
app.post('/updateprofidonneur',(req,res)=>{
var info={
 id :req.session.user,
 mail:req.body.mail ,
 nom :req.body.nom,
 prenom :req.body.prenom,
 groupeSanguin:req.body.groupeSanguin,
 rhesus:req.body.rhesus,
 dernierDon:req.body.dernierDon ,
 adresse:req.body.adresse,
 codePostal:req.body.codePostal,
 numero:req.body.numero
}
model.Updatedonneur(info);
res.redirect('/profildonneur');
})

app.get('/changepasswordDonneur',(req,res)=>{

res.render('changepasswordDonneur');
})
app.post('/changepasswordDonneur',(req,res)=>{
var password=model.getpassworduser(req.session.user);

if(password==req.body.password){
model.changepassword(req.body.newpassword);
res.redirect('/profildonneur');
}
else res.redirect('/changepasswordDonneur')

})

app.get('/eligible',(req,res)=>{
var info={
nom:"Savoir si vous etes éligible"
}
res.render('etesvouseligible',info);
})
app.post('/eligible',(req,res)=>{
var oui="oui"
if(req.body.age==oui && req.body.poid==oui && req.body.date==oui){
var info={
nom:"vous etes eligible"
}

}
else {
var info={
nom:"vous n'etes pas eligible"
}
}
res.render('etesvouseligible',info)

})

app.get('/changepasswordadmincentre',(req,res)=>{
res.render('changepasswordAdmincentre')
})
app.post('/changepasswordadmincentre',(req,res)=>{

var password=model.getpassworduser(req.session.user);

if(password==req.body.password){
model.changepassword(req.body.newpassword);
res.redirect('/profiladmincentre');
}
else res.redirect('/changepasswordadmincentre')

})
app.get('/notification',(req,res)=>{
var list=[];
var j=0;

var centre=model.getCentreAdmin(req.session.user)
var tabledonneur=model.donneurRendezvous(centre.id);
//console.log(model.donneurRendezvous(centre.id))
for(var i=0;i<model.donneurRendezvous(centre.id).length;i++){
list[j]=copyinlist(model.donnesUser(tabledonneur[i].idDonneur),tabledonneur[i].date)
j++;
}

model.MakeReadone(centre.id);
res.render('notification',{"loop" :list})

})
app.get('/mainadmin',(req,res)=>{
res.render('mainadministrateur')
})

app.get('/centreadmin',(req,res)=>{
res.render('cardsforcentre')
})

app.get('/ajoutercentre',(req,res)=>{
res.render('ajoutercentre');
})
app.post('/ajoutercentre',(req,res)=>{
var info={
nom:req.body.nom,
adresse:req.body.adresse,
codePostal:req.body.codePostal,
mail:req.body.mail,
numero:req.body.numero,
heureOuverture:req.body.heureOuverture,
heureFermeture:req.body.heureFermeture,
logo:req.body.logo
}
model.nouveauCentre(info);
res.redirect('/centreadmin');
})
app.get('/modifiercentre',(req,res)=>{
var centres=model.allCentre();
res.render('modificiercentre',{'loop':centres})

})

app.post('/modifiercentre',(req,res)=>{

var centre=model.searchCentreWithName(req.body.s);
req.session.name= centre.id;
centre.heureOuverture=ChangeFormatHour(centre.heureOuverture)
centre.heureFermeture=ChangeFormatHour(centre.heureFermeture)
res.render('Updatecentre',centre);
})

app.post('/updatecentre',(req,res)=>{


model.updateCentre(req.session.name,req.body.nom,req.body.adresse,req.body.logo,req.body.heureOuverture,req.body.heureFermeture,req.body.codePostal, req.body.mail,req.body.numero)
res.redirect('/centreadmin')
})
app.get('/supprimercentre',(req,res)=>{
var centres=model.allCentre();
res.render('supprimercentre',{'loop':centres})

})
app.post('/supprimercentre',(req,res)=>{
var centre=model.searchCentreWithName(req.body.s);
model.supprimerCentre(centre.id);
res.redirect('/centreadmin')
})


app.get('/demandeadmsite',(req,res)=>{

res.render('demandesite',{"loop":model.selectAdminDemande()})
})
app.post('/acceptadminsite',(req,res)=>{
var user=model.SelectFromAttenteUser(req.body.id);

console.log(model.NewAdmin(user));
console.log(model.DeleteuserFromAttente(req.body.id));
res.redirect('/demandeadmsite')
})

app.post('/refuseradminsite',(req,res)=>{
console.log(req.body.id)
console.log(model.DeleteuserFromAttente(req.body.id));
res.redirect('/demandeadmsite');
})

app.get('/demandeadmcentre',(req,res)=>{

res.render('demandesite',{"loop":model.Selectadmincentre()})
})

app.post('/acceptadmincentr',(req,res)=>{
var user=model.SelectFromAttenteUser(req.body.id);


console.log(model.NewAdmin(user));
console.log(model.DeleteuserFromAttente(req.body.id));
res.redirect('/demandeadmsite')


})
app.post('/refuseradmincentre',(req,res)=>{
console.log(req.body.id)
console.log(model.DeleteuserFromAttente(req.body.id));
res.redirect('/demandeadmsite');

})

app.get('/profiladmin',(req,res)=>{
res.render('profiladmin', model.ListInfoUser(req.session.user))
})
app.get('/SupprimerAdministrator',(req,res)=>{
model.DeleteUser(req.session.user);
req.session = null;
res.redirect('/')
})
app.get('/changepasswordadmini',(req,res)=>{
res.render('changepasswordadmins')
})

app.post('/changepasswordadmins',(req,res)=>{
var password=model.getpassworduser(req.session.user);

if(password==req.body.password){
model.changepassword(req.body.newpassword);
res.redirect('/profiladmin');
}
else res.redirect('/changepasswordadmini')

})


app.get('/centreadminuser',(req,res)=>{
res.render('users',{'loop':model.SelectadmincentreUser()});
})
app.post('/supprimeruserfromadmin',(req,res)=>{
model.DeleteUser(req.body.id);
res.redirect('/centreadminuser')
})


function copyinlist(donneur,date){
var list={};

for(var key in donneur){
list[key]=donneur[key];
}
list["date"]=date;
return list;

}

function ChangeFormatHour(word){
var t='';
var k=0;
for(var i=0;i<word.length;i++){
if(word[i]!=':'){
if(word[i]!='h'){
t=t+word[i]
k++;
if(k==2){
t=t+':'
k++;
}
}
}
}
return t;
}

function diviserpardeux(list){
var tab=[];
var i=0;
var m=0;
console.log(list.length)
for(var k=0;k<list.length;k++){
if(i==1){

var deuxlist=concatener(copylist,list[k]);

tab[m]=deuxlist;
m++;
i=0;
}
else if(i==0){
var copylist={}

copylist= changekey(list[k]);
i++;
}

}
if(i==1)tab[m]=copylist;
return tab;
}
function concatener(list1,list2){
var list={};
for(var key in list1){
list[key]=list1[key];
}
for(var key in list2){
list[key]=list2[key];
}
return list;
}


function changekey(list){
var copylist={};
for(var key in list){
var copykey=key+"1";

copylist[copykey]=list[key];
}
return copylist;

}

function searchdonneur(req,codepostal){
return {
groupeSanguin: req.body.customRadio,
    rhesus: req.body.customRadio2,
    codePostal:codepostal
}
}
function Updateadmincenre(req){
return{
id:req.session.user,
  nom: req.body.nom,
    prenom: req.body.prenom,
    mail : req.body.mail
    
}
}

function signup_newevent(req){
return{
nom:req.body.nom, 
description:req.body.description,
date:req.body.date,
lieu:req.body.lieu,
 heureOuverture:req.body.houverture,
  heureFermeture:req.body.hfermeture,
   codePostal:req.body.codepostal,
   userid:req.session.user
}
}

function signup_donneur(req) {
  return {
    nom: req.body.nom,
    prenom: req.body.prenom,
    password: req.body.pswd,
    groupeSanguin: req.body.customRadio,
    rhesus: req.body.customRadio2,
    dernierDon: req.body.dernierDon,
    adresse: req.body.adresse,
    codePostal: req.body.code_postal,
    mail: req.body.email,
    numero: req.body.numero
  }
}

function signupadmin(req){
return{

    nom: req.body.nom,
    prenom: req.body.prenom,
    password: req.body.password,
    mail : req.body.email,

}
}


function signup_admin_centre(req) {
  return {
    nom: req.body.nom,
    prenom: req.body.prenom,
    password: req.body.password,
    mail : req.body.mail,
     centreID :searchidcentre(req.body.centre).id
  }
}

function searchidcentre(nomcentre){
return model.searchcentre(nomcentre);
}


app.listen(port, () => console.log('listening on http://localhost:3000'));
