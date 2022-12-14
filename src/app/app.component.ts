import { Component } from '@angular/core';
import { __values } from 'tslib';
import { Papa } from 'ngx-papaparse';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Match';
  file: any;
  finalData: any[] = [];
  maleList: any = new Set();
  femaleList: any = new Set();
  matchResults = '';
  displayResults: any[] = [];
  resultsData: any[] = [];

  constructor(private papa: Papa, private sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  matchPercentage(male: any, female: any) {
    const charMap = new Map();
    var source = male + ' matches ' + female;

    for (let i = 0; i < source.length; i++) {
      if (source[i] == ' ')
        continue;

      var count = 0;
      if (charMap.has(source[i])) {
        count = charMap.get(source[i]);
        count = count + 1;
        charMap.set(source[i], count);
      }
      else {
        charMap.set(source[i], 1);
      }
    }

    var charCount = '';
    charMap.forEach(function (value, key) {
      charCount += value;
    }
    );

    var percentage = this.getPercentage(charCount);
    let sortData =
    {
      male: male,
      female: female,
      percentage: percentage,
    };
    this.resultsData.push(sortData)
  }

  getPercentage(textValues: any): any {
    if (textValues.length == 2) {
      return textValues;
    }

    let appendedSum = "";
    for (let i = 0; i < textValues.length / 2; i++) {
      var firstNumber = parseInt(textValues[i]);
      var loopV = Math.trunc(textValues.length / 2);

      if (!this.isEven(textValues.length / 2) && loopV === i)
        var secondNumber = 0;
      else
        var secondNumber = parseInt(textValues[textValues.length - 1 - i]);

      var sum = firstNumber + secondNumber;
      // console.log(firstNumber + " + " + secondNumber + " = " + sum);
      appendedSum += sum;
      // console.log(appendedSum);
    }
    return this.getPercentage(appendedSum);
  }

  isEven(num: any) {
    if (num % 2 == 0)
      return true
    else
      return false
  }

  handleFileSelect(evt: any) {
    var files = evt.target.files; // FileList object
    var file = files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (event: any) => {
      var csv = event.target.result; // Content of CSV file
      this.papa.parse(csv, {
        skipEmptyLines: true,
        header: true,
        complete: (results: any) => {
          for (let i = 0; i < results.data.length; i++) {
            let personDetails = {
              Name: results.data[i].Name,
              Gender: results.data[i].Gender,
            };
            this.finalData.push(personDetails);
          }
          this.groupGender();
          this.matchMaleFemale();
        },
      });
    };
  }

  groupGender() {
    for (var person of this.finalData) {

      if (person.Gender == 'f') {
        this.femaleList.add(person.Name);
      }
      else {
        this.maleList.add(person.Name);
      }
    }
  }

  matchMaleFemale() {
    for (var male of this.maleList) {
      for (var female of this.femaleList) {
        this.matchPercentage(male, female)
      }
    }

    this.resultsData = this.resultsData.sort(function (a, b) {

      if (a.percentage > b.percentage) {
        return -1;
      }
      if (a.percentage < b.percentage) {
        return 1;
      }

      if (a.male < b.male) {
        return -1;
      }
      if (a.male > b.male) {
        return 1;
      }

      return 0;

    });

    for (var data of this.resultsData) {

      if (parseInt(data.percentage) >= 80) {
        console.log(this.matchResults);
        this.displayResults.push(data.male + " matches " + data.female + " " + data.percentage + "%, good match\n");
      }
      else {
        console.log(this.matchResults);
        this.displayResults.push(data.male + " matches " + data.female + " " + data.percentage + "%\n");
      }
    }
    const blob = new Blob(this.displayResults, { type: 'application/octet-stream' });
    this.file = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }

}
