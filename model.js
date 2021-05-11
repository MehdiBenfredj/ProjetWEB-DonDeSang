"use strict"
/* Module de recherche dans une base de recettes de cuisine */
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

//Manipulation des données du donateur

//Ajouter un nouveau donneur

exports.nouveauDonneur = function (req) {
  var verify = oneMail(req.mail);
  console.log(verify)
  if ( verify !== undefined ) {
    return -1;
  }
  else {
    var id = db.prepare('INSERT INTO USER ( nom , prenom , password , role ,  groupeSanguin , rhesus , dernierDon , adresse , codePostal , mail , numero ) values(@nom, @prenom, @password, 2 , @groupeSanguin, @rhesus, @dernierDon, @adresse, @codePostal, @mail, @numero)').run(req).lastInsertRowid;
    return id;
  }
}

//supprimer un donateur

exports.supprimerDonneur = function (id) {
  db.prepare('delete from USER where id=(?)').run(id);
}

//Modifier données d'un donneur
exports.updateDonneur = function (nom, prenom, password, groupeSanguin, dernierDon, adresse, codePostal, mail, numero) {
  var donneur = db.prepare('UPDATE donneur set nom=(?),prenom=(?),password=(?),groupeS=(?),DernierDon=(?),Adresse=(?),codepostal=(?),mail=(?),numero=(?) where id=(?)').run(nom, prenom, password, groupeSanguin, dernierDon, adresse, codePostal, mail, numero, id);
  return donneur;
}
//nouveau admin


//Manipulation des données du centre 

//Ajouter un nouveau centre
exports.nouveauCentre = function (centre) {
  var id = db.prepare('INSERT INTO CENTRE (nom , adresse , logo ,heureFermeture,heureOuverture,codePostal,mail,numero) values(@nom, @adresse, @logo, @heureFermeture, @heureOuverture, @codePostal, @mail, @numero);').run(centre).lastInsertRowid;
  return id;
}

//Fonction qui assure l'utilisation d'un seul email 
var oneMail = function(enteredMail) {
  var id = db.prepare('SELECT id from USER WHERE mail=(?)').get(enteredMail);
  return id;
}

exports.supprimerCentre = function (id) {
  db.prepare('delete from CENTRE where id=(?)').run(id);
}

exports.updateCentre = function (id, nom, adresse, logo, heureOuverture, heureFermeture, codePostal, mail, numero) {
  var id = db.prepare('UPDATE CENTRE set nom=(?),adresse=(?),logo=(?),heureOuverture=(?), heureFermeture=(?),codepostal=(?),mail=(?),numero=(?) where id=(?)').run(nom, adresse, logo, heureOuverture, heureFermeture, codePostal, mail, numero, id).lastInsertRowid;
  return id;
}

exports.nouveauAdminCentre = function (admin) {
  var id = db.prepare('INSERT INTO USER ( nom , prenom , mail , password , role , centreID) VALUES (@nom , @prenom , @mail , @password , 1, @centreID)').run(admin).lastInsertRowid;
  return id;
}
exports.nouveauAdminCentreWithattente= function (admin) {
  var id = db.prepare('INSERT INTO attente( nom , prenom , mail , password , role , centreID) VALUES (@nom , @prenom , @mail , @password , 1, @centreID)').run(admin).lastInsertRowid;
  return id;
}

// ajouter evenement

exports.newevenement=function(req){
var id=db.prepare('INSERT INTO EVENEMT (nom, description, date,lieu,heureOuverture, heureFermeture, codePostal,userid) VALUES(@nom,@description, @date,@lieu,@heureOuverture,@heureFermeture,@codePostal,@userid)').run(req).lastInsertRowid;
return id;

}




exports.login = function (mail, password) {
  var user = db.prepare("SELECT * FROM USER WHERE mail = ? and password = ? ;").get(mail, password);
  if (user === undefined) {
    return -1
  } else {
    return user.id
  }
}

exports.listCentres=function(){
var list=db.prepare("SELECT * FROM CENTRE").all();
return list;
}

exports.searchcentre=function(name){
var id=db.prepare('SELECT id from CENTRE where nom=(?)').get(name);
return id;
}
exports.searchcentreWithid=function(id){
var centre=db.prepare('SELECT * from CENTRE where id=(?)').get(id);
return centre;
}
exports.searchRoleUser=function(mail){
var role=db.prepare('select role from user where mail=(?)').get(mail);
return role.role;
}

exports.SelectEventWithUserId=function(id){
var events=db.prepare('SELECT * FROM EVENEMT WHERE userid=(?)').all(id);
return events;
}
exports.SelectEventWithname=function(name){
var event=db.prepare('SELECT * FROM EVENEMT WHERE nom=(?)').get(name);
return event;
}
exports.UpdateEvent=function(req){
db.prepare('UPDATE EVENEMT set description=(?),date=(?),lieu=(?),heureOuverture=(?),heureFermeture=(?),codePostal=(?), nom=(?) where id=(?)').run(req.body.description,req.body.date,req.body.lieu,req.body.houverture,req.body.hfermeture,req.body.codepostal,req.body.nom,req.session.name);
}
 exports.SupprimerEvent=function(req){
 db.prepare('DELETE FROM EVENEMT WHERE nom=(?)').run(req.body.s);
 }

exports.EventToCome=function(id){

var events=db.prepare('SELECT * FROM EVENEMT WHERE DATE(date)>DATE(CURRENT_TIMESTAMP) and userid=(?)').all(id);
return events;
}

exports.HistoriqueEvent=function(id){

var events=db.prepare('SELECT * FROM EVENEMT WHERE DATE(date)<DATE(CURRENT_TIMESTAMP) and userid=(?)').all(id);
return events;
}
exports.SearchUser=function(id){
var user=db.prepare('SELECT * FROM USER WHERE id=(?)').get(id);
return user;
}
exports.getCentreAdmin=function(id){
var id=exports.SearchUser(id).id;
var id=db.prepare('SELECT centreID FROM USER WHERE id=(?)').get(id);
var centre=db.prepare('SELECT * FROM CENTRE WHERE id=(?)').get(id.centreID);
return centre;
}

exports.ListInfoUser=function(id){
var list={};
var user=exports.SearchUser(id);
for(var keys in user){
list[keys]=user[keys];
}
var centre=exports.getCentreAdmin(id);
for(var keys in centre){
var sim=keys;
if(keys=="nom" )sim="nomcentre"
if(keys=="mail" )sim="mailcentre"
list[sim]=centre[keys]
}
return list;
}
exports.DeleteUser=function(id){
db.prepare('DELETE FROM USER WHERE id=(?)').run(id);
}
exports.UpdateAdmincentre=function(s){
db.prepare('UPDATE USER SET mail=@mail,nom=@nom,prenom=@prenom where id=@id').run(s);
}


//chercher un donneur 
exports.searchdonneur=function(info){
var donneurs=db.prepare("select * from User where groupeSanguin=@groupeSanguin and rhesus=@rhesus and codePostal-@codePostal<1000 and codePostal-@codePostal>-1000 ").all(info);
return donneurs;
}

//chercher le code postal d'un user
exports.searchcodepostal=function(id){
var centre=exports.getCentreAdmin(id);
console.log(centre);
return centre.codePostal;
}
exports.getCentrecloseofdonneur=function(id){

var codepostal=db.prepare('SELECT codePostal FROM USER WHERE id=(?)').get(id);
codepostal=codepostal.codePostal;

var listCentre=db.prepare('SELECT * FROM CENTRE WHERE codePostal-'+codepostal+'<1000 and codePostal-'+codepostal+'>-1000').all();
return listCentre;
}

exports.searchEventWithCodePostal=function(id){

var codepostal=db.prepare('SELECT codePostal FROM USER WHERE id=(?)').get(id);
codepostal=codepostal.codePostal;

var listCentre=db.prepare('SELECT * FROM EVENEMT WHERE codePostal-'+codepostal+'<1000 and codePostal-'+codepostal+'>-1000').all();
return listCentre;


}

//nouveau rendez-vous
exports.nouveaurendezvous=function(info){
var id= db.prepare("INSERT INTO Rendez_vous(idCentre,idDonneur,date,read) values(@idCentre,@idDonneur,@date,0)").run(info).lastInsertRowid;
return id;

}
//changer les info
exports.Updatedonneur=function(s){
db.prepare('UPDATE USER SET mail=@mail,nom=@nom,prenom=@prenom,groupeSanguin=@groupeSanguin,rhesus=@rhesus, dernierDon=@dernierDon,adresse=@adresse,codePostal=@codePostal,numero=@numero where id=@id').run(s);
}
exports.getpassworduser=function(id){
var password=db.prepare('SELECT password FROM USER where id=(?)').get(id);
return password.password;
}


exports.changepassword=function(newp){
db.prepare('UPDATE user SET password=(?)').run(newp);
}

exports.donneurRendezvous=function(idcentre){
var donneurs=db.prepare('SELECT idDonneur,date FROM Rendez_vous where idCentre=(?) and read=0 ').all(idcentre);
return donneurs;
}

exports.donnesUser=function(id){
return(db.prepare('SELECT * FROM user where id=(?)').get(id))

}

exports.MakeReadone=function(centreid){
db.prepare('UPDATE Rendez_vous set read=1  where idCentre=(?)').run(centreid);
}



exports.NewAdmin=function(req){
  var verify = oneMail(req.mail);
  console.log(verify)
  if ( verify !== undefined ) {
    return -1;
  }
  else {
    var id = db.prepare('INSERT INTO USER ( nom , prenom ,role, password , mail) values(@nom, @prenom, 0,@password, @mail)').run(req).lastInsertRowid;
    return id;
}
}
exports.NewAdminWithattente=function(req){
  var verify = oneMail(req.mail);
  
  if ( verify !== undefined ) {
    return -1;
  }
  else {
    var id = db.prepare('INSERT INTO attente ( nom , prenom ,role, password , mail) values(@nom, @prenom, 0,@password, @mail)').run(req).lastInsertRowid;
    return id;
}
}

exports.allCentre=function(){
var centres=db.prepare('SELECT * FROM CENTRE').all();
return centres;

}

exports.searchCentreWithName=function(name){
var centre=db.prepare('SELECT * FROM centre where nom=(?)').get(name);
return centre;

}
exports.selectAdminDemande=function(){
var users=db.prepare('SELECT * FROM attente where role=0').all();
return users;

}
exports.SelectFromAttenteUser=function(id){
var user=db.prepare('SELECT * FROM attente where id=(?)').get(id);
return user;

}
exports.DeleteuserFromAttente=function(id){
db.prepare('DELETE FROM attente where id=(?)').run(id);

}
exports.Selectadmincentre=function(){
var users=db.prepare('SELECT * FROM attente where role=1').all();
return users;
}
exports.SelectadmincentreUser=function(){
var users=db.prepare('SELECT * FROM user where role=1').all();
return users;
}

console.log(db.prepare('SELECT * FROM attente').all())


