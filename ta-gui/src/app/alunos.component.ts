import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Aluno } from '../../../common/aluno';
import { AlunoService } from './aluno.service';

  @Component({
   selector: 'app-root',
   standalone: false,
   templateUrl: './alunos.component.html',
   styleUrls: ['./alunos.component.css']
 })
 export class AlunosComponent implements OnInit {

    aluno: Aluno = new Aluno();
    alunos: Aluno[] = [];
    cpfduplicado: boolean = false;
    githubduplicado: boolean = false;

    constructor(private alunoService: AlunoService, private cdr: ChangeDetectorRef) {}

     criarAluno(a: Aluno): void {
       this.alunoService.criar(a)
              .subscribe(
                ar => {
                  if (ar) {
                    this.alunos.push(ar); this.cdr.markForCheck();
                    this.aluno = new Aluno();
                  } else {
                    this.cpfduplicado = !!this.alunos.find(x => x.cpf == a.cpf); this.githubduplicado = !!this.alunos.find(x => x.github == a.github); this.cdr.markForCheck();
                  } 
                },
                msg => { alert(msg.message); }
              );
    } 

    onMove(): void {
       this.cpfduplicado = false; this.githubduplicado = false;
    }

     ngOnInit(): void {
       this.alunoService.getAlunos()
             .subscribe(
               as => { this.alunos = as; this.cdr.markForCheck(); },
               msg => { alert(msg.message); }
              );
     }

  }