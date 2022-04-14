import { Injectable } from "@nestjs/common";
import { SlackService } from "nestjs-slack";

@Injectable()
export class SlackMessage {
  constructor(private service : SlackService){
    this.service = service
  }
  
  sendText(m : string): Promise<void>{
    return this.service.sendText(m);
  }

 
}