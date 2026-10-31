import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { Aluno } from '../../../common/aluno';
import { AlunoService } from './aluno.service';

@Component({
  selector: 'metas',
  standalone: false,
  templateUrl: './metas.component.html',
  styleUrl: './metas.component.css'
})
export class MetasComponent implements OnInit {
   alunos: Aluno[];

   constructor(private alunoService: AlunoService,
               private cd: ChangeDetectorRef) {}

   atualizarAluno(aluno: Aluno): void {
      this.alunoService.atualizar(aluno).subscribe({
         next: a => { if (a == null) alert("Unexpected fatal error trying to update student information!"); },
         error: msg => { alert(msg.message); }
      });
   }

   ngOnInit(): void {
      this.alunoService.getAlunos()
          .subscribe({
             next: as => { this.alunos = as; this.cd.markForCheck(); },
             error: msg => { alert(msg.message); }
          });
   }
}
