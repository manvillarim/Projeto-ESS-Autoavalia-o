import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { Aluno } from '../../../common/aluno';
import { AlunoService } from './aluno.service';

@Component({
  selector: 'alunos',
  standalone: false,
  templateUrl: './alunos.component.html',
  styleUrl: './alunos.component.css'
})
export class AlunosComponent implements OnInit {
   aluno: Aluno = new Aluno();
   alunos: Aluno[] = [];
   cpfduplicado: boolean = false;

   constructor(private alunoService: AlunoService,
               private cd: ChangeDetectorRef) {}

   criarAluno(a: Aluno): void {
      this.alunoService.criar(a.clone())
          .subscribe({
             next: ar => {
               if (ar) {
                 this.alunos.push(ar);
                 this.aluno = new Aluno();
               } else {
                 this.cpfduplicado = true;
               }
               this.cd.markForCheck();
             },
             error: msg => { alert(msg.message); }
          });
   }

   removerAluno(a: Aluno): void {
      this.alunoService.remover(a).subscribe({
         next: ar => {
            if (ar) {
               this.alunos.splice(this.alunos.indexOf(a), 1);
            } else {
               alert("Não foi possível remover o aluno.");
            }
            this.cd.markForCheck();
         },
         error: msg => { alert(msg.message); }
      });
   }

   onMove(): void {
      this.cpfduplicado = false;
   }

   ngOnInit(): void {
      this.alunoService.getAlunos()
          .subscribe({
             next: as => { this.alunos = as; this.cd.markForCheck(); },
             error: msg => { alert(msg.message); }
          });
   }
}
