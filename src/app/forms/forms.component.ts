import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { defer, from, Subscription } from 'rxjs';
import { FormsService } from './forms.service';
import { KelasPerlombaan } from './kelas-perlombaan.model';
import { Pendaftaran } from './pendaftaran.model';
import { SelectionModel } from '@angular/cdk/collections';
import * as JsBarcode from 'jsbarcode';
import * as moment from 'moment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.css'],
})
export class FormsComponent implements OnInit, OnDestroy {
  @ViewChild('noooohhh') noooohhh!: ElementRef;

  pendaftaranForm!: FormGroup;
  kelasPerlombaan!: KelasPerlombaan[];
  subs!: Subscription;

  selection = new SelectionModel<KelasPerlombaan>(true, []);

  constructor(private fs: FormsService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initPendaftaranForm();
    this.fetchKelas();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  initPendaftaranForm() {
    this.pendaftaranForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      placeOfBirth: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      nik: ['', Validators.required],
      phone: ['', [Validators.required, Validators.minLength(11)]],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/),
        ],
      ],
      city: ['', Validators.required],
      team: ['', Validators.required],
      class: [null, Validators.required],
      registered: [false],
    });
  }

  fetchKelas() {
    this.subs = this.fs.getKelasPerlombaan().subscribe((resp) => {
      this.kelasPerlombaan = resp;
    });
  }

  keyPress(event: KeyboardEvent) {
    const pattern = /[0-9\+\-\ ]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  checkbox(value: KelasPerlombaan) {
    this.selection.toggle(value);
    this.form('class').patchValue(this.selection.selected);
  }

  form(name: string) {
    return this.pendaftaranForm.controls[name];
  }

  submit() {
    const isFormValid = this.pendaftaranForm.valid;
    if (!isFormValid) {
      this.pendaftaranForm.markAllAsTouched();
      return;
    }
    const formVal = this.pendaftaranForm.value as Pendaftaran;
    formVal.dateOfBirth = moment(formVal.dateOfBirth).format('DD/MM/YYYY');
    Swal.fire({
      title: 'Kamu akan melakukan pendaftaran!',
      icon: 'info',
      confirmButtonText: 'Ya',
      denyButtonText: 'Tidak',
      showDenyButton: true,
      allowEscapeKey: true
    }).then((value) => {
      if (value.isConfirmed) {
        const id = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
        this.subs = defer(() => from(this.fs.submitPendaftaran(id, formVal))).subscribe(
          (resp) => {
            JsBarcode(this.noooohhh.nativeElement, id);
            const base64Img = (this.noooohhh.nativeElement as HTMLImageElement).src;
    
            fetch(base64Img)
              .then((res) => res.blob())
              .then((blob) => {
                this.subs = defer(() =>
                  from(this.fs.uploadBarcode(blob, id))
                ).subscribe((resp) => {
                  const email = this.form('email').value;
    
                  this.subs = defer(() =>
                    from(this.fs.sendEmailPendaftaran(email, resp, id))
                  ).subscribe(() => {
                    Swal.fire({
                      title: 'Anda sudah mendaftar!',
                      icon: 'success',
                      text: 'Kami telah mengirimkan barcode ke email anda. Silahkan cek email anda!',
                      confirmButtonText: 'Ok'
                    }).then(() => {
                      this.pendaftaranForm.reset();
                      this.selection.clear();
                    })
                  });
                });
              });
          }
        );
      } else {
        return
      }
    })
  }
}
