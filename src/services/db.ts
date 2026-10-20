import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CartProduct, OrderData } from '../utils/pricing';
import { INITIAL_PRODUCTS } from '../data/products';

export async function fetchProductsFromDb(): Promise<CartProduct[]> {
  const path = 'products';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      return INITIAL_PRODUCTS;
    }
    return snap.docs.map(d => d.data() as CartProduct);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return INITIAL_PRODUCTS;
  }
}

export async function seedProducts() {
  const path = 'products';
  try {
    for (const prod of INITIAL_PRODUCTS) {
      await setDoc(doc(db, path, prod.slug), prod);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateProductInDb(slug: string, patch: Partial<CartProduct>) {
  const path = `products/${slug}`;
  try {
    await updateDoc(doc(db, 'products', slug), patch as any);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function saveOrderToDb(order: OrderData) {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), order);

    // Update stock in Firestore
    for (const item of order.items) {
      try {
        const prodRef = doc(db, 'products', item.slug);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          const currentStock = prodSnap.data().stock ?? 24;
          const newStock = Math.max(0, currentStock - item.cantidad);
          await updateDoc(prodRef, { stock: newStock });
        }
      } catch {}
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchOrdersFromDb(userEmail?: string): Promise<OrderData[]> {
  const path = 'orders';
  try {
    let q = query(collection(db, path));
    if (userEmail) {
      q = query(collection(db, path), where('customer.email', '==', userEmail));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as OrderData);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
}

export async function updateOrderStatusInDb(orderId: string, estado: string) {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), { estado });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function saveLeadToDb(lead: { id: string; email: string; nombre?: string; tipo: string; createdAt: string }) {
  const path = `leads/${lead.id}`;
  try {
    await setDoc(doc(db, 'leads', lead.id), lead);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchLeadsFromDb() {
  const path = 'leads';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(d => d.data());
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
}

export async function saveComplaintToDb(complaint: any) {
  const path = `complaints/${complaint.ticket}`;
  try {
    await setDoc(doc(db, 'complaints', complaint.ticket), complaint);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchComplaintsFromDb() {
  const path = 'complaints';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(d => d.data());
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
}

export async function saveUserToDb(user: { id: string; nombre: string; email: string; whatsapp?: string; role: string }) {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), user);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
