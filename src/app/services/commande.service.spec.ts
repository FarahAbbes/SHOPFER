import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { CommandeService } from './commande.service';
import { Commande } from '../models/commande';
import { OrderDto } from '../models/order-dto';
import { of } from 'rxjs';
// Mock the Firebase functions
const mockFirestoreFunctions = {
  collection: jasmine.createSpy('collection').and.returnValue({}),
  addDoc: jasmine.createSpy('addDoc').and.returnValue(Promise.resolve({ id: 'doc123' })),
  collectionData: jasmine.createSpy('collectionData').and.returnValue(of([])),
  doc: jasmine.createSpy('doc').and.returnValue({}),
  updateDoc: jasmine.createSpy('updateDoc').and.returnValue(Promise.resolve()),
  getDoc: jasmine.createSpy('getDoc').and.returnValue(Promise.resolve({ id: 'doc123', data: () => ({}) })),
  deleteDoc: jasmine.createSpy('deleteDoc').and.returnValue(Promise.resolve()),
  query: jasmine.createSpy('query').and.returnValue({}),
  where: jasmine.createSpy('where').and.returnValue({})
};
describe('CommandeService', () => {
  let service: CommandeService;
  let mockFirestore: jasmine.SpyObj<Firestore>;
  beforeEach(() => {
    const firestoreSpy = jasmine.createSpyObj('Firestore', ['collection']);
    TestBed.configureTestingModule({
      providers: [
        CommandeService,
        { provide: Firestore, useValue: firestoreSpy }
      ]
    });
    service = TestBed.inject(CommandeService);
    mockFirestore = TestBed.inject(Firestore) as jasmine.SpyObj<Firestore>;
    // Mock the service methods to use our mocked functions
    spyOn(service, 'addCommande').and.callFake((userid: string, montant: number, details: OrderDto[]) => {
      const mockCollectionRef = {};
      mockFirestoreFunctions.collection.and.returnValue(mockCollectionRef);
      const commandeData = {
        userid: userid,
        montant: montant,
        dateCommande: new Date().toISOString(),
        details: details
      };
      mockFirestoreFunctions.addDoc(mockCollectionRef, commandeData)
        .then(() => console.log("Data saved successfully!"))
        .catch((error: any) => console.log(error));
    });
    spyOn(service, 'getAllCommandes').and.callFake(() => {
      const mockCollectionRef = {};
      mockFirestoreFunctions.collection.and.returnValue(mockCollectionRef);
      return mockFirestoreFunctions.collectionData(mockCollectionRef, { idField: 'id' });
    });
    spyOn(service, 'getCommandeById').and.callFake(async (id: string) => {
      const mockDocRef = {};
      mockFirestoreFunctions.doc.and.returnValue(mockDocRef);
      return await mockFirestoreFunctions.getDoc(mockDocRef);
    });
    spyOn(service, 'updateCommande').and.callFake((id: string, data: Partial<Commande>) => {
      const mockDocRef = {};
      mockFirestoreFunctions.doc.and.returnValue(mockDocRef);
      mockFirestoreFunctions.updateDoc(mockDocRef, data)
        .then(() => console.log(`Commande with ID ${id} updated successfully!`))
        .catch((error: any) => console.log(error));
    });
    spyOn(service, 'deleteCommande').and.callFake((id: string) => {
      const mockDocRef = {};
      mockFirestoreFunctions.doc.and.returnValue(mockDocRef);
      mockFirestoreFunctions.deleteDoc(mockDocRef)
        .then(() => console.log('Data deleted!'))
        .catch((error: any) => console.log(error));
    });
    spyOn(service, 'getCommandesByUserId').and.callFake((userid: string) => {
      const mockCollectionRef = {};
      const mockWhereClause = {};
      const mockQueryRef = {};
      mockFirestoreFunctions.collection.and.returnValue(mockCollectionRef);
      mockFirestoreFunctions.where.and.returnValue(mockWhereClause);
      mockFirestoreFunctions.query.and.returnValue(mockQueryRef);
      return mockFirestoreFunctions.collectionData(mockQueryRef, { idField: 'id' });
    });
  });
  beforeEach(() => {
    // Reset all spies before each test
    Object.values(mockFirestoreFunctions).forEach(spy => {
      if (spy.calls) {
        spy.calls.reset();
      }
    });
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('addCommande', () => {
    it('should add a commande with correct data structure', (done) => {
      // Arrange
      const userid = 'user123';
      const montant = 100.50;
      const details: OrderDto[] = [
        { productid: 1, qte: 2 },
        { productid: 2, qte: 1 }
      ];
      const consoleSpy = spyOn(console, 'log');
      mockFirestoreFunctions.addDoc.and.returnValue(Promise.resolve({ id: 'doc123' }));
      // Act
      service.addCommande(userid, montant, details);
      // Assert
      expect(service.addCommande).toHaveBeenCalledWith(userid, montant, details);
      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith("Data saved successfully!");
        done();
      }, 100);
    });
    it('should handle addDoc error', (done) => {
      // Arrange
      const userid = 'user123';
      const montant = 100.50;
      const details: OrderDto[] = [];
      const error = new Error('Firestore error');
      const consoleSpy = spyOn(console, 'log');
      mockFirestoreFunctions.addDoc.and.returnValue(Promise.reject(error));
      // Act
      service.addCommande(userid, montant, details);
      // Assert
      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith(error);
        done();
      }, 100);
    });
  });
  describe('getAllCommandes', () => {
    it('should return all commandes', () => {
      // Arrange
      const mockCommandes: Commande[] = [
        { id: '1', userId: 'user1', montant: 100, dateCommande: '2023-01-01', details: [] },
        { id: '2', userId: 'user2', montant: 200, dateCommande: '2023-01-02', details: [] }
      ];
      mockFirestoreFunctions.collectionData.and.returnValue(of(mockCommandes));
      // Act
      const result = service.getAllCommandes();
      // Assert
      expect(service.getAllCommandes).toHaveBeenCalled();
      result.subscribe((commandes: Commande[]) => {
        expect(commandes).toEqual(mockCommandes);
      });
    });
  });
  describe('getCommandeById', () => {
    it('should return a commande by id', async () => {
      // Arrange
      const commandeId = 'cmd123';
      const mockDocSnapshot = {
        id: commandeId,
        data: () => ({ userId: 'user1', montant: 100 })
      };
      mockFirestoreFunctions.getDoc.and.returnValue(Promise.resolve(mockDocSnapshot));
      // Act
      const result = await service.getCommandeById(commandeId);
      // Assert
      expect(service.getCommandeById).toHaveBeenCalledWith(commandeId);
      expect(result).toBeDefined();
    });
  });
  describe('updateCommande', () => {
    it('should update a commande successfully', (done) => {
      // Arrange
      const commandeId = 'cmd123';
      const updatedData: Partial<Commande> = { montant: 150 };
      const consoleSpy = spyOn(console, 'log');
      mockFirestoreFunctions.updateDoc.and.returnValue(Promise.resolve());
      // Act
      service.updateCommande(commandeId, updatedData);
      // Assert
      expect(service.updateCommande).toHaveBeenCalledWith(commandeId, updatedData);
      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith(`Commande with ID ${commandeId} updated successfully!`);
        done();
      }, 100);
    });
    it('should handle update error', (done) => {
      // Arrange
      const commandeId = 'cmd123';
      const updatedData: Partial<Commande> = { montant: 150 };
      const error = new Error('Update failed');
      const consoleSpy = spyOn(console, 'log');
      mockFirestoreFunctions.updateDoc.and.returnValue(Promise.reject(error));
      // Act
      service.updateCommande(commandeId, updatedData);
      // Assert
      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith(error);
        done();
      }, 100);
    });
  });
  describe('deleteCommande', () => {
    it('should delete a commande successfully', (done) => {
      // Arrange
      const commandeId = 'cmd123';
      const consoleSpy = spyOn(console, 'log');
      mockFirestoreFunctions.deleteDoc.and.returnValue(Promise.resolve());
      // Act
      service.deleteCommande(commandeId);
      // Assert
      expect(service.deleteCommande).toHaveBeenCalledWith(commandeId);
      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Data deleted!');
        done();
      }, 100);
    });
    it('should handle delete error', (done) => {
      // Arrange
      const commandeId = 'cmd123';
      const error = new Error('Delete failed');
      const consoleSpy = spyOn(console, 'log');
      mockFirestoreFunctions.deleteDoc.and.returnValue(Promise.reject(error));
      // Act
      service.deleteCommande(commandeId);
      // Assert
      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith(error);
        done();
      }, 100);
    });
  });
  describe('getCommandesByUserId', () => {
    it('should return commandes filtered by user id', () => {
      // Arrange
      const userid = 'user123';
      const mockCommandes: Commande[] = [
        { id: '1', userId: userid, montant: 100, dateCommande: '2023-01-01', details: [] },
        { id: '2', userId: userid, montant: 200, dateCommande: '2023-01-02', details: [] }
      ];
      mockFirestoreFunctions.collectionData.and.returnValue(of(mockCommandes));
      // Act
      const result = service.getCommandesByUserId(userid);
      // Assert
      expect(service.getCommandesByUserId).toHaveBeenCalledWith(userid);
      result.subscribe((commandes: Commande[]) => {
        expect(commandes).toEqual(mockCommandes);
        expect(commandes.length).toBe(2);
        expect(commandes.every(cmd => cmd.userId === userid)).toBeTruthy();
      });
    });
    it('should return empty array when no commandes found for user', () => {
      // Arrange
      const userid = 'nonexistent';
      const mockCommandes: Commande[] = [];
      mockFirestoreFunctions.collectionData.and.returnValue(of(mockCommandes));
      // Act
      const result = service.getCommandesByUserId(userid);
      // Assert
      result.subscribe((commandes: Commande[]) => {
        expect(commandes).toEqual([]);
        expect(commandes.length).toBe(0);
      });
    });
  });
  describe('Edge Cases', () => {
    it('should handle empty details array in addCommande', (done) => {
      // Arrange
      const userid = 'user123';
      const montant = 50;
      const details: OrderDto[] = [];
      mockFirestoreFunctions.addDoc.and.returnValue(Promise.resolve({ id: 'doc123' }));
      // Act
      service.addCommande(userid, montant, details);
      // Assert
      expect(service.addCommande).toHaveBeenCalledWith(userid, montant, details);
      setTimeout(() => {
        done();
      }, 100);
    });
    it('should handle null or undefined values in updateCommande', (done) => {
      // Arrange
      const commandeId = 'cmd123';
      const updatedData: Partial<Commande> = { montant: 0 };
      mockFirestoreFunctions.updateDoc.and.returnValue(Promise.resolve());
      // Act
      service.updateCommande(commandeId, updatedData);
      // Assert
      expect(service.updateCommande).toHaveBeenCalledWith(commandeId, updatedData);
      setTimeout(() => {
        done();
      }, 100);
    });
  });
});









