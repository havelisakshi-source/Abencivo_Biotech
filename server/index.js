import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "./db.js";
import {auth} from "./auth.js";
import {recipientFor} from "./team.js";
dotenv.config();
const app=express(), port=process.env.PORT||4000;
app.use(cors({origin:process.env.CORS_ORIGIN||"http://localhost:5173"}));
app.use(express.json({limit:"2mb"}));
fs.mkdirSync("uploads",{recursive:true});
app.use("/uploads",express.static("uploads"));

app.get("/api/health",(req,res)=>res.json({ok:true,service:"Abencivo Biotech API"}));
app.post("/api/auth/login",(req,res)=>{
 const {email,password}=req.body||{}, a=db.prepare("SELECT * FROM admins WHERE email=?").get(email);
 if(!a||!bcrypt.compareSync(password||"",a.password_hash))return res.status(401).json({message:"Invalid email or password"});
 const token=jwt.sign({id:a.id,email:a.email},process.env.JWT_SECRET,{expiresIn:"8h"});
 res.json({token});
});
app.get("/api/products",(req,res)=>res.json(db.prepare("SELECT * FROM products WHERE active=1 ORDER BY id DESC").all()));
app.get("/api/products/:id",(req,res)=>{const p=db.prepare("SELECT * FROM products WHERE id=? AND active=1").get(req.params.id);p?res.json(p):res.status(404).json({message:"Not found"})});
app.post("/api/enquiries",async(req,res)=>{
 const {name,phone,email,city,type,message}=req.body||{};
 if(!name||!phone||!message)return res.status(400).json({message:"Name, phone and message are required"});
 const enquiryType=type||"General";
 const person=recipientFor(enquiryType); // the specific team member who owns this enquiry type
 const result=db.prepare("INSERT INTO enquiries(name,phone,email,city,type,message,assigned_to) VALUES(?,?,?,?,?,?,?)")
   .run(name,phone,email||"",city||"",enquiryType,message,person.name);

 let emailed=false;
 if(process.env.SMTP_HOST&&person.email){
   try{
     const transporter=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:String(process.env.SMTP_SECURE)==="true",auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});

     // 1) Notify the specific responsible person.
     await transporter.sendMail({
       from:process.env.MAIL_FROM||process.env.SMTP_USER,
       to:person.email,
       subject:`[${enquiryType}] New enquiry #${result.lastInsertRowid} — ${name}`,
       text:`Hi ${person.name},\n\nA new ${enquiryType} enquiry needs your attention.\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email||"Not provided"}\nCity: ${city||"Not provided"}\n\nMessage:\n${message}\n\n— Assigned to you as the ${person.name} for this enquiry type. Update its status from the admin dashboard once you've followed up.`
     });

     // 2) Optional courtesy confirmation to the customer, only if they gave an email.
     if(email){
       await transporter.sendMail({
         from:process.env.MAIL_FROM||process.env.SMTP_USER,
         to:email,
         subject:`We received your enquiry — ${process.env.MAIL_FROM_NAME||"Abencivo Biotech"}`,
         text:`Hi ${name},\n\nThanks for reaching out. Your ${enquiryType} enquiry has been received and assigned to our ${person.name}, who will contact you shortly at ${phone}.\n\nYour message:\n${message}\n\nRegards,\nAbencivo Biotech`
       });
     }
     emailed=true;
     db.prepare("UPDATE enquiries SET emailed=1 WHERE id=?").run(result.lastInsertRowid);
   }catch(e){console.error("Email error:",e.message)}
 } else {
   // SMTP not configured — still make it obvious in the server log who owns this lead.
   console.log(`New ${enquiryType} enquiry #${result.lastInsertRowid} saved. Assigned to: ${person.name}. Configure SMTP in .env to email them automatically.`);
 }
 res.status(201).json({message:emailed?`Enquiry submitted. ${person.name} has been notified.`:"Enquiry submitted successfully.",id:result.lastInsertRowid});
});
app.get("/api/admin/products",auth,(req,res)=>res.json(db.prepare("SELECT * FROM products ORDER BY id DESC").all()));
app.post("/api/admin/products",auth,(req,res)=>{const p=req.body||{};if(!p.name)return res.status(400).json({message:"Name required"});const r=db.prepare("INSERT INTO products(name,composition,dosage_form,category,image_url,description) VALUES(?,?,?,?,?,?)").run(p.name,p.composition||"",p.dosage_form||"",p.category||"General",p.image_url||"/products/product-placeholder.svg",p.description||"");db.prepare("INSERT INTO audit_logs(admin_id,action,entity,entity_id) VALUES(?,?,?,?)").run(req.user.id,"CREATE","product",r.lastInsertRowid);res.status(201).json({id:r.lastInsertRowid})});
app.put("/api/admin/products/:id",auth,(req,res)=>{const p=req.body||{};db.prepare("UPDATE products SET name=?,composition=?,dosage_form=?,category=?,image_url=?,description=?,active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(p.name,p.composition,p.dosage_form,p.category,p.image_url,p.description,p.active?1:0,req.params.id);db.prepare("INSERT INTO audit_logs(admin_id,action,entity,entity_id) VALUES(?,?,?,?)").run(req.user.id,"UPDATE","product",req.params.id);res.json({ok:true})});
app.delete("/api/admin/products/:id",auth,(req,res)=>{db.prepare("UPDATE products SET active=0,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(req.params.id);db.prepare("INSERT INTO audit_logs(admin_id,action,entity,entity_id) VALUES(?,?,?,?)").run(req.user.id,"DELETE","product",req.params.id);res.json({ok:true})});
app.get("/api/admin/enquiries",auth,(req,res)=>res.json(db.prepare("SELECT * FROM enquiries ORDER BY id DESC").all()));
app.patch("/api/admin/enquiries/:id",auth,(req,res)=>{const {status}=req.body||{};db.prepare("UPDATE enquiries SET status=? WHERE id=?").run(status||"New",req.params.id);db.prepare("INSERT INTO audit_logs(admin_id,action,entity,entity_id) VALUES(?,?,?,?)").run(req.user.id,"STATUS","enquiry",req.params.id);res.json({ok:true})});
app.get("/api/admin/audit-logs",auth,(req,res)=>res.json(db.prepare("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 500").all()));

const upload=multer({dest:"uploads/",limits:{fileSize:5*1024*1024}});
app.post("/api/admin/upload",auth,upload.single("file"),(req,res)=>{if(!req.file)return res.status(400).json({message:"File required"});const ext=path.extname(req.file.originalname).toLowerCase();const allowed=[".jpg",".jpeg",".png",".webp",".svg",".pdf"];if(!allowed.includes(ext)){fs.unlinkSync(req.file.path);return res.status(400).json({message:"File type not allowed"})}const newName=`${Date.now()}-${req.file.filename}${ext}`;fs.renameSync(req.file.path,path.join("uploads",newName));res.json({url:`/uploads/${newName}`})});
app.listen(port,()=>console.log(`API running on http://localhost:${port}`));
