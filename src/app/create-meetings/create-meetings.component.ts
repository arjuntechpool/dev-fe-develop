import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { ServiceService } from '../services/service.service';
import { environment } from 'src/environments/environment';
import { MatTableDataSource } from '@angular/material/table';
import { SearchUserComponent } from '../search-user/search-user.component';
import { MatSnackBar } from '@angular/material/snack-bar';

// Create an interface file for your models
export interface Meeting {
  meeting_id?: number;
  meeting_code: string;
  meeting_name: string;
  meeting_name_ln?: string;
  active?: number;
  office_id: number;
  child?: MeetingChild[];
}

export interface MeetingChild {
  child_id?: number;
  meeting_id: number;
  child_name: string;
  active?: number;
}

@Component({
  selector: 'app-create-meetings',
  templateUrl: './create-meetings.component.html',
  styleUrls: ['./create-meetings.component.scss'],
})
export class CreateMeetingsComponent implements OnInit {
  @Output() expandToggled = new EventEmitter<void>();
  isExpanded = false;
  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    this.expandToggled.emit();
  }
  meetings: any[] = [];
  meetingChildren: any[] = [];
  officeId: number = 1;

  // Form model to store selected values
  selectedMeetings = {
    meeting_id: '',
    meeting_code: '',
    meeting_name: '',
    meeting_name_ln: '',
  };

  // Variable to track whether the form is in edit mode
  isEditable: boolean = false;
  is_loading: boolean = false; // handle loader
  // Track whether the form is in Add New mode or Edit mode
  isAddMode: boolean = false;
  subject_data: any = [];
  displayedColumns: string[] = [
    'slNo',
    'meeting_code',
    'meeting_name',
    'status',
    'select',
    'delete',
  ];
  dataSource: any;
  selectedRow: any;
  meeting_id : any;
  deactive: any; //to activate/ deactivate primary subject
  bilingual: any; //for handle the local languages
  language: any; // check the bilingual whether true/false
  showError: boolean = false; // for handle the vlidation errr message
  msg: string = ''; // to store validation messages

  // Active class for table row when clicks
  activeRowIndex: number | null = null; // Track the active row index

  selected_user = {
    seat_name: '',
    seat_id: '',
    user_name: '',
    user_eamil: '',
    user_mob: '',
    user_id: '',
  };
  flg_owner: boolean = false;
  dataSource1: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  displayedColumns1: string[] = [
    'slNo',
    'seat_name',
    'user_name',
    'email',
    'mobile',
    'delete',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private commonsvr: ServiceService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.language = environment.lang;
    console.log(this.language);
    this.bilingual = environment.bilingual;
    console.log(this.bilingual);
    this.fetch_meetings(); //to fetch all primary subjects
    this.dataSource1 = new MatTableDataSource<any>([]);
  }

  // Handle "Add New" button click
  addNewMeeting() {
    this.meeting_id = null; //Reset to save new subject
    this.activeRowIndex = null;
    this.isEditable = false;
    this.isAddMode = true; // Set to Add New mode
    this.showError = false; //to hide err msg
    this.deactive = false;
    // Clear the form fields for adding a new subject
    this.selectedMeetings = {
      meeting_id: '',
      meeting_code: '',
      meeting_name: '',
      meeting_name_ln: '',
    };
    this.paginator.firstPage();
  }

  // Handle "Edit" button click
  editSubject() {
    this.isEditable = true;
    this.isAddMode = false; // Set to Edit mode
    this.saveMeeting();
  }

  // Handle "Cancel" button click
  cancelEdit() {
    this.isEditable = true; // Exit edit mode
    this.isAddMode = true; // Exit edit mode
    this.meeting_id  = null;
    this.paginator.firstPage();
    if (this.isAddMode) {
      // Clear form in Add New mode
      this.selectedMeetings = {
        meeting_id: '',
        meeting_code: '',
        meeting_name: '',
        meeting_name_ln: '',
      };
      this.isEditable = false;
      this.isAddMode = false;
    }
    this.showError = false;
  }

  // check if all data entry are valid
  validate_meeting() {
    // Clear error messages before validation
    this.msg = '';
    this.showError = false;

    // Check if  Subject Name is empty or undefined
    if (
      this.selectedMeetings.meeting_name == '' ||
      this.selectedMeetings.meeting_name.trim().length === 0
    ) {
      this.msg = 'Enter Primary Subject Name!';
      this.showError = true;
      return false;
    }

    // If all checks pass
    return true;
  }

  // In fetch_meetings() method:
  fetch_meetings() {
    this.is_loading = true;
    this.commonsvr
      .getService('api/v0/get_meetings', { officeId: this.officeId })
      .subscribe(
        (res: any) => {
          console.log(res);
          this.subject_data = res;
          this.dataSource = new MatTableDataSource(this.subject_data);
          this.is_loading = false;
          this.dataSource.paginator = this.paginator;
        },
        (error) => {
          console.error('Error fetching meetings', error);
          this.is_loading = false;
          this.openCustomSnackbar('error', 'Failed to fetch meetings');
        }
      );
  }

  // In fetchMeetingChildren() method:
  fetchMeetingChildren(meetingId: number): void {
    this.commonsvr
      .getService('api/v0/get_meeting_child', { meeting_id: meetingId })
      .subscribe(
        (data: any) => {
          this.meetingChildren = data;
        },
        (error) => {
          console.error('Error fetching meeting children', error);
          this.openCustomSnackbar('error', 'Failed to fetch meeting details');
        }
      );
  }

  saveMeeting() {
    if (!this.validate_meeting()) {
      console.log(this.msg);
      return;
    }

    const meetingData = {
      meeting_id: this.meeting_id , // Use existing ID for updates
      meeting_name: this.selectedMeetings.meeting_name,
      meeting_code: this.selectedMeetings.meeting_code,
      office_id: this.officeId,
      active: this.deactive == true ? 9 : 1,
      child: this.meetingChildren,
    };

    this.is_loading = true;
    this.commonsvr.saveMeeting(meetingData).subscribe(
      (response: any) => {
        console.log('Meeting saved successfully', response);
        if (response.data) {
          this.openCustomSnackbar('success', 'Saved Successfully');
          this.meeting_id  = response.data.meeting_id;
        } else {
          this.openCustomSnackbar('error', 'Failed to save');
        }

        if (this.meeting_id ) {
          this.isEditable = true;
        }
        this.fetch_meetings();
        this.is_loading = false;
        this.isAddMode = false;
      },
      (error) => {
        console.error('Error saving meeting', error);
        this.openCustomSnackbar('error', 'Failed to save: ' + error.message);
        this.is_loading = false;
      }
    );
  }

  onMeetingSelect(meetingId: number): void {
    this.fetchMeetingChildren(meetingId);
  }

  //to get data from table to edit subject
  onRowClick(e: any, index: number): void {
    console.log(e);
    this.activeRowIndex = index;
    this.meeting_id  = e.meeting_id ;
    this.deactive = e.active == 9 ? true : false;
    this.selectedMeetings = {
      meeting_id: '1',
      meeting_code: e.primary_code,
      meeting_name: e.meeting_name ,
      meeting_name_ln: e.meeting_name_ln,
    };
    this.showError = false;
    this.isEditable = true; // The form starts in view mode
    this.isAddMode = false; // Disable Add Mode
  }

  // apply filter based on search box entry
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Success toast
  openCustomSnackbar(type: string, msg: string) {
    const cssClass = type === 'success' ? 'success-snackbar' : 'error-snackbar';
    this.snackBar.open(msg, 'Close', {
      duration: 3000,
      panelClass: [cssClass]
    });
  }

  // clear error message
  clear_msg() {
    this.showError = false;
  }

  //to navigate to sub subject component
  navigate(row: any) {}

  clear_err() {
    this.showError = false;
    this.msg = '';
  }

  restrictAllEntry(e: any) {
    // Implement input validation/restriction logic
    const pattern = /[0-9a-zA-Z]/;
    const inputChar = String.fromCharCode(e.charCode);
    if (!pattern.test(inputChar)) {
      e.preventDefault();
    }
  }

  add_user_tolist() {
    console.log('Selected User:', this.selected_user);

    // Validate user selection
    if (!this.selected_user || !this.selected_user.user_id) {
      this.openCustomSnackbar('error', 'Please select a user first.');
      return;
    }

    // Prepare user data for the table
    const userToAdd = {
      seat_name: this.selected_user.seat_name,
      user_name: this.selected_user.user_name,
      email: this.selected_user.user_eamil, // Note: there's a typo in 'user_eamil'
      mobile: this.selected_user.user_mob,
      is_owner: this.flg_owner
    };

    // Get current data
    const currentData = this.dataSource1.data;

    // Check for duplicate
    const userExists = currentData.some(
      user => user.user_name === userToAdd.user_name
    );

    if (userExists) {
      this.openCustomSnackbar('error', 'User already added.');
      return;
    }

    // Add new user
    currentData.push(userToAdd);

    // Update data source
    this.dataSource1 = new MatTableDataSource(currentData);

    // Reset selection
    this.clear_user_details();

    console.log('Updated Table Data:', this.dataSource1.data);
  }

  clear_user_details() {
    this.selected_user = {
      seat_name: '',
      seat_id: '',
      user_name: '',
      user_eamil: '',
      user_mob: '',
      user_id: ''
    };
    this.flg_owner = false;
  }

  openUserSearch() {
    var dialogRef = this.dialog.open(SearchUserComponent, {
      width: '1130px',
    });

    dialogRef?.afterClosed().subscribe((data: any) => {
      console.log('User selected from dialog:', data); // Debug log

      if (!data || !data.user_id) {
        this.openCustomSnackbar('error', 'No user selected.');
        return;
      }

      this.selected_user = data;
      this.flg_owner = true;
      this.dataSource1 = new MatTableDataSource([this.selected_user]);
      this.dataSource1.paginator = this.paginator;
      this.dataSource1.sort = this.sort;
      console.log('Selected user stored:', this.selected_user); // Debug log
    });
  }
}
