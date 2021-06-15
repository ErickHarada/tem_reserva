import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { switchMap } from 'rxjs/operators';
import { EstablishmentListService } from 'src/app/establishment-dashboard/services/establishment-list.service';
import { AccountType } from 'src/app/models/account.model';
import { Reserve, ReservePerDay } from 'src/app/models/reserve.model';
import { RoutesEnum } from 'src/app/models/routes.enum';
import { DayOfWeekEnum } from 'src/app/models/week.enum';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReserveEstablishmentService } from '../services/reserve-establishment.service';

@Component({
  selector: 'reserve-establishment',
  templateUrl: './reserve-establishment.component.html',
  styleUrls: ['./reserve-establishment.component.scss']
})
export class ReserveEstablishmentComponent implements OnInit {

  dayOfWeek = [
    DayOfWeekEnum.SUNDAY,
    DayOfWeekEnum.MONDAY,
    DayOfWeekEnum.TUESDAY,
    DayOfWeekEnum.WEDNESDAY,
    DayOfWeekEnum.THURSDAY,
    DayOfWeekEnum.FRIDAY,
    DayOfWeekEnum.SATURDAY,
  ];

  reserves: ReservePerDay[] = [];
  loading = true;

  constructor(
    private reserveService: ReserveEstablishmentService,
    private readonly sessionService: SessionService,
    private readonly router: Router,
    private readonly establishmentListService: EstablishmentListService,
  ) { }

  ngOnInit(): void {
    if (this.sessionService.getLoginType() === AccountType.USER) {
      this.router.navigate([RoutesEnum.RESERVE_USER]);
    }

    this.reserveService.getReservesByUserEstablishmentId(this.sessionService.getUserSession().id).subscribe(res => {
      this.reserves = this.orderReserves(res);
      this.loading = false;
    });
  }

  orderReserves(res: ReservePerDay[]): ReservePerDay[] {
    const r = [];
    res.forEach(d => {
      let reserve: ReservePerDay = {
        day: d.day,
        maxNumberOfPeople: d.maxNumberOfPeople,
        currentPeople: d.currentPeople,
        reserves: d.reserves.sort((a, b) => { return new Date(a.reserveDate).getTime() - new Date(b.reserveDate).getTime() })
      };
      r.push(reserve);
    });
    return r;
  }

  maskCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, (regex, block1, block2, block3, block4) => {
      regex;
      return block1 + '.' + block2 + '.' + block3 + '-' + block4;
    }
    );
  }

  maskHour(hour: string): string {
    return moment(hour).format('HH:mm');
  }

  mapDate(date: string): string {
    const day = new Date(date.replace('-', '/'));
    return `${this.dayOfWeek[day.getDay()]} ${day.toLocaleDateString('pt-br')}`;
  }

  cancelReserve(id: number) {
    this.reserveService.cancelReservation(id).pipe(
      switchMap(() => this.reserveService.getReservesByUserEstablishmentId(this.sessionService.getUserSession().id)))
      .subscribe(res => this.reserves = res);
  }

  confirmReserve(r: Reserve) {
    console.log(r);
    r.confirmed = false;
    this.reserveService.editReservation(r).pipe(
      switchMap(() => this.reserveService.getReservesByUserEstablishmentId(this.sessionService.getUserSession().id)))
      .subscribe(res => this.reserves = this.orderReserves(res));
  }

  getCurrentPeople(date: string) {
    return this.reserves
      .find(d => d.day === date)?.currentPeople
      .find(p => p.period === this.establishmentListService.getPeriod())?.currentPeople ?
      this.reserves
        .find(d => d.day === date)?.currentPeople
        .find(p => p.period === this.establishmentListService.getPeriod())?.currentPeople : 0;
  }

}
