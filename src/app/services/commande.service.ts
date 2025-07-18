import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, getDoc, deleteDoc,query, where } from '@angular/fire/firestore';
import { Commande } from '../models/commande';
import { OrderDto } from '../models/order-dto';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  commandes: Array<Commande> | undefined;

  constructor(private readonly fs: Firestore) {}

  addCommande(userid: string, montant: number, details: Array<OrderDto>) {
    // Transforming details to plain objects
    const plainDetails = details.map(item => ({
      productid: item.productid,
      qte: item.qte
    }));

    const commandeData: any = {
      userid: userid,
      montant: montant,
      dateCommande: new Date().toISOString(),
      details: plainDetails // Use transformed details
    };

    // Code for Firestore
    const collectionInstance = collection(this.fs, 'commandes');
    addDoc(collectionInstance, commandeData)
      .then(() => console.log("Data saved successfully!"))
      .catch(error => console.log(error));
  }


  getAllCommandes() {
    const collectionInstance = collection(this.fs,'commandes')

    return  collectionData(collectionInstance, {idField : 'id'})
  }


  getCommandeById(id: string) {
    const docInstance = doc(this.fs, 'commandes', id);
    return getDoc(docInstance);
  }

  updateCommande(id: string, updatedData: Partial<Commande>) {
    const docInstance = doc(this.fs, 'commandes', id);
    updateDoc(docInstance, updatedData)
      .then(() => console.log(`Commande with ID ${id} updated successfully!`))
      .catch(error => console.log(error));
  }

  deleteCommande(id: string) {
    const docInstance = doc(this.fs, 'commandes', id);
    deleteDoc(docInstance)
      .then(() => console.log('Data deleted!'))
      .catch(error => console.log(error));
  }
  getCommandesByUserId(userid: string): Observable<Commande[]> {
    const collectionInstance = collection(this.fs, 'commandes');
    const userQuery = query(collectionInstance, where('userid', '==', userid));
    return collectionData(userQuery, { idField: 'id' }) as Observable<Commande[]>;
  }
}
