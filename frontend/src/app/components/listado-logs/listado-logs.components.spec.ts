import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoLogsComponent } from './listado-logs.components';

describe('ListadoLogsComponent', () => {
  let component: ListadoLogsComponent;
  let fixture: ComponentFixture<ListadoLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoLogsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
