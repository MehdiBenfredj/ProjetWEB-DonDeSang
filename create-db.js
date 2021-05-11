"use strict"

const fs = require('fs');
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

var load = function() {
//db.prepare('DROP TABLE Rendez_vous').run();
  db.prepare('CREATE TABLE IF NOT EXISTS USER ( id INTEGER PRIMARY KEY AUTOINCREMENT, mail TEXT NOT NULL, nom TEXT NOT NULL , prenom TEXT NOT NULL , role INTEGER NOT NULL , password TEXT NOT NULL , groupeSanguin TEXT , rhesus TEXT , dernierDon DATE , adresse TEXT , codePostal INTEGER , numero TEXT , centreID INTEGER ) ;').run();

  db.prepare('CREATE TABLE IF NOT EXISTS CENTRE(id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL , adresse TEXT NOT NULL , codePostal INTEGER NOT NULL , mail TEXT NOT NULL , numero TEXT NOT NULL , heureOuverture TEXT NOT NULL, heureFermeture TEXT NOT NULL, logo TEXT NOT NULL )').run();

  db.prepare('CREATE TABLE IF NOT EXISTS  EVENEMT(id INTEGER PRIMARY KEY AUTOINCREMENT ,nom TEXT NOT NULL , description TEXT NOT NULL , date TEXT NOT NULL , lieu TEXT NOT NULL ,heureOuverture TEXT NOT NULL , heureFermeture TEXT NOT NULL,codePostal TEXT NOT NULL,userid INTEGER NOT NULL)').run();
  db.prepare('CREATE TABLE IF NOT EXISTS  Rendez_vous(id INTEGER PRIMARY KEY AUTOINCREMENT,idCentre INTEGER,idDonneur  INTEGER,date DATE,read INTEGER)').run();
  db.prepare('CREATE TABLE  IF NOT EXISTS attente( id INTEGER PRIMARY KEY AUTOINCREMENT, mail TEXT NOT NULL, nom TEXT NOT NULL , prenom TEXT NOT NULL , role INTEGER NOT NULL , password TEXT NOT NULL , groupeSanguin TEXT , rhesus TEXT , dernierDon DATE , adresse TEXT , codePostal INTEGER , numero TEXT , centreID INTEGER )  ').run();
/*
  var insert = db.prepare("INSERT INTO USER ( mail , nom , prenom , role , password) VALUES ('jimmy@gmail.com' , 'Ait Kettout' , 'Younes' , 0 , 'admin')").run();
  var insert2 = db.prepare("INSERT INTO USER ( mail , nom , prenom , role , password) VALUES ('mehdibenfredj3@gmail.com' , 'BENFREDJ' , 'Mehdi' , 0 , 'admin')").run();
*/
/*var insert= db.prepare("INSERT INTO CENTRE( nom,adresse,codePostal,mail,numero,heureOuverture,heureFermeture,logo) VALUES ('jimmy@gmail.com' , 'Ait Kettout' ,1300, 'Younes' ,'salut', 'admin','admin','kakoo')").run();
  var read = db.prepare("select * from CENTRE").all();
  console.log(read);*/
/*  var insert= db.prepare("INSERT INTO CENTRE( nom,adresse,codePostal,mail,numero,heureOuverture,heureFermeture,logo) VALUES ('Maison du don' , '28 Rue de la République, 13001 Marseille' ,13001, 'maisondon@gmail.com' ,' 0496112290', '08h00','17h00','kakoo')").run();
  var insert= db.prepare("INSERT INTO CENTRE( nom,adresse,codePostal,mail,numero,heureOuverture,heureFermeture,logo) VALUES ('EFS - Toulon - Hopital Sainte Musse' , ' 54 Rue Henri Sainte-Claire Deville, 83000 Toulon' ,83000, 'toulon@gmail.com' ,' 04 98 08 08 50', '09h00','15h00','..')").run();*/
  

  
}


load();
