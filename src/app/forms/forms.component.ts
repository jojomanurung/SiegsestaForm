import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { defer, from, Subscription } from 'rxjs';
import { FormsService } from './forms.service';
import { KelasPerlombaan } from './kelas-perlombaan.model';
import { Pendaftaran } from './pendaftaran.model';
import { SelectionModel } from '@angular/cdk/collections';
import * as JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.css']
})
export class FormsComponent implements OnInit {
  @ViewChild('noooohhh') noooohhh!: ElementRef;

  pendaftaranForm!: FormGroup;
  kelasPerlombaan!: KelasPerlombaan[];
  subs!: Subscription

  selection = new SelectionModel<string>(true, []);

  barcode: string = '';

  constructor(private fs: FormsService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initPendaftaranForm();
    this.fetchKelas();
    this.barcode = 'abc';
  }

  initPendaftaranForm() {
    this.pendaftaranForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        placeOfBirth: ['', Validators.required],
        dateOfBirth: ['', Validators.required],
        nik: ['', Validators.required],
        phone: ['', Validators.required],
        email: ['', Validators.required],
        city: ['', Validators.required],
        team: ['', Validators.required],
        class: [null],
      }
    )
  }

  fetchKelas() {
    this.subs = this.fs.getKelasPerlombaan().subscribe((resp) => {
      this.kelasPerlombaan = resp;
    })
  }

  submit() {
    console.log('Submit');
    const isFormValid = this.pendaftaranForm.valid;
    if (!isFormValid) {
      this.pendaftaranForm.markAllAsTouched();
      return
    }
    const formVal = this.pendaftaranForm.value as Pendaftaran;
    formVal.class = this.selection.selected
    console.log('formVal', formVal);
    this.subs = defer(() => from(this.fs.submitPendaftaran(formVal))).subscribe((resp) => {
      console.log(resp);
      this.barcode = resp;
      JsBarcode(this.noooohhh.nativeElement, this.barcode);
      const fileNameToDownload = 'image_qrcode';
      const base64Img = (this.noooohhh.nativeElement as HTMLImageElement).src;
      console.log(base64Img);
      fetch(base64Img)
      .then(res => res.blob())
      .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileNameToDownload;
            link.click();
      })
    })
  }

  checks($event:any) {
    console.log($event);
  }
}
