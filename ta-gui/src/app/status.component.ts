import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { Aluno } from '../../../common/aluno';
import { AlunoService } from './aluno.service';

// Status da auto-avaliação de um aluno: "Completed" quando ele atribuiu um
// conceito a todas as metas da turma, "In progress" quando atribuiu a algumas
// e "Pending" quando não atribuiu a nenhuma.
export type Status = 'Pending' | 'In progress' | 'Completed';

export interface StatusDeAluno {
  nome: string;
  cpf: string;
  status: Status;
}

export const METAS: string[] = ['requisitos', 'gerDeConfiguracao', 'gerDeProjetos', 'testes'];
export const CONCEITOS_ACEITOS: string[] = ['MANA', 'MPA', 'MA'];

// Ordem usada ao ordenar por status: primeiro quem ainda não começou.
const ORDEM_DOS_STATUS: Status[] = ['Pending', 'In progress', 'Completed'];

export function statusDe(aluno: Aluno): Status {
  const metas: any = aluno.metas || {};
  const avaliadas = METAS.filter(m => CONCEITOS_ACEITOS.includes(metas[m])).length;
  if (avaliadas === METAS.length) return 'Completed';
  if (avaliadas > 0) return 'In progress';
  return 'Pending';
}

@Component({
  selector: 'status',
  standalone: false,
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {
  constructor(private alunoService: AlunoService, private cdr: ChangeDetectorRef) {}

  alunos: StatusDeAluno[] = [];
  carregado: boolean = false;
  somenteFaltando: boolean = false;
  ordenadoPorStatus: boolean = false;

  get concluidas(): number {
    return this.alunos.filter(a => a.status === 'Completed').length;
  }

  get faltando(): number {
    return this.alunos.length - this.concluidas;
  }

  get percentual(): number {
    return this.alunos.length === 0 ? 0 : Math.round(100 * this.concluidas / this.alunos.length);
  }

  get alunosVisiveis(): StatusDeAluno[] {
    let lista = this.somenteFaltando ? this.alunos.filter(a => a.status !== 'Completed') : this.alunos.slice();
    if (this.ordenadoPorStatus) {
      lista.sort((a, b) => ORDEM_DOS_STATUS.indexOf(a.status) - ORDEM_DOS_STATUS.indexOf(b.status));
    }
    return lista;
  }

  ordenarPorStatus(): void {
    this.ordenadoPorStatus = true;
  }

  ngOnInit(): void {
    this.alunoService.getAlunos().subscribe(
      (as) => {
        this.alunos = as.map(a => ({ nome: a.nome, cpf: a.cpf, status: statusDe(a) }));
        this.carregado = true;
        this.cdr.markForCheck();
      },
      (msg) => { alert(msg.message); }
    );
  }
}
