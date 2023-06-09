import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionSnapshots,
  doc,
  Firestore,
  serverTimestamp,
  setDoc,
} from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { KelasPerlombaan } from './kelas-perlombaan.model';
import { Pendaftaran } from './pendaftaran.model';
import {
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class FormsService {
  kelasRef = collection(this.store, 'kelas_perlombaan');
  pendaftaranRef = collection(this.store, 'pendaftaran');
  mail = collection(this.store, 'mail');

  constructor(private store: Firestore, private cloudStorage: Storage) {}

  getKelasPerlombaan() {
    return collectionSnapshots(this.kelasRef).pipe(
      map((docs) => {
        return docs.map((doc) => {
          const data = doc.data() as KelasPerlombaan;
          data.id = doc.id;
          return data;
        });
      })
    );
  }

  async submitPendaftaran(id: string, form: Pendaftaran) {
    const payload = form;
    payload.timestamp = serverTimestamp();

    const docRef = await setDoc(doc(this.pendaftaranRef, id), payload);
    return docRef
  }

  async uploadBarcode(blob: any, name: string) {
    const fileRef = ref(this.cloudStorage, `barcode/${name}`);
    await uploadBytes(fileRef, blob);
    return getDownloadURL(fileRef);
  }

  async sendEmailPendaftaran(to: string, barcode: any, code: string) {
    const payload = {
      to: [to],
      template: {
        name: 'send_barcode',
        data: {
          bcImg: barcode,
          bCode: code
        },
      },
    };
    const mailRef = await addDoc(this.mail, payload);
    return mailRef;
  }
}
