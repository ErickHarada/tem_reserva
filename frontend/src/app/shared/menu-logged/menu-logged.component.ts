import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Establishment } from 'src/app/models/establishment.model';
import { RoutesEnum } from 'src/app/models/routes.enum';
import { UserModel } from 'src/app/models/user.model';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'menu-logged',
  templateUrl: './menu-logged.component.html',
  styleUrls: ['./menu-logged.component.scss']
})
export class MenuLoggedComponent implements OnInit {

  @Output() closeMenu = new EventEmitter();
  routesEnum = RoutesEnum;
  user: UserModel | Establishment;
  typeMenu: string;

  constructor(
    private sessionService: SessionService,
  ) { }

  ngOnInit(): void {
    this.sessionService.$userSession.subscribe(u => {
      if (u && u?.est) {
        this.user = u.est;
        this.typeMenu = 'est';
      } else if (u && u?.user) {
        this.user = u.user;
        this.typeMenu = 'user';
      }
    });
  }

  /**
   * Emite evento para fechar o menu
   */
  close(): void {
    this.closeMenu.emit();
  }

  getEditRoute(): string {
    return this.typeMenu === 'user' ? this.routesEnum.EDIT_USER : this.routesEnum.EDIT_ESTABLISHMENT;
  }

}
