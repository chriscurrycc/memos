// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.36.5
// 	protoc        (unknown)
// source: api/v1/activity_service.proto

package apiv1

import (
	_ "google.golang.org/genproto/googleapis/api/annotations"
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	timestamppb "google.golang.org/protobuf/types/known/timestamppb"
	reflect "reflect"
	sync "sync"
	unsafe "unsafe"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type Activity struct {
	state protoimpl.MessageState `protogen:"open.v1"`
	// The name of the activity.
	// Format: activities/{id}
	Name string `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	// The uid of the user who created the activity.
	CreatorId int32 `protobuf:"varint,2,opt,name=creator_id,json=creatorId,proto3" json:"creator_id,omitempty"`
	// The type of the activity.
	Type string `protobuf:"bytes,3,opt,name=type,proto3" json:"type,omitempty"`
	// The level of the activity.
	Level string `protobuf:"bytes,4,opt,name=level,proto3" json:"level,omitempty"`
	// The create time of the activity.
	CreateTime *timestamppb.Timestamp `protobuf:"bytes,5,opt,name=create_time,json=createTime,proto3" json:"create_time,omitempty"`
	// The payload of the activity.
	Payload       *ActivityPayload `protobuf:"bytes,6,opt,name=payload,proto3" json:"payload,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *Activity) Reset() {
	*x = Activity{}
	mi := &file_api_v1_activity_service_proto_msgTypes[0]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *Activity) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Activity) ProtoMessage() {}

func (x *Activity) ProtoReflect() protoreflect.Message {
	mi := &file_api_v1_activity_service_proto_msgTypes[0]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Activity.ProtoReflect.Descriptor instead.
func (*Activity) Descriptor() ([]byte, []int) {
	return file_api_v1_activity_service_proto_rawDescGZIP(), []int{0}
}

func (x *Activity) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

func (x *Activity) GetCreatorId() int32 {
	if x != nil {
		return x.CreatorId
	}
	return 0
}

func (x *Activity) GetType() string {
	if x != nil {
		return x.Type
	}
	return ""
}

func (x *Activity) GetLevel() string {
	if x != nil {
		return x.Level
	}
	return ""
}

func (x *Activity) GetCreateTime() *timestamppb.Timestamp {
	if x != nil {
		return x.CreateTime
	}
	return nil
}

func (x *Activity) GetPayload() *ActivityPayload {
	if x != nil {
		return x.Payload
	}
	return nil
}

type ActivityPayload struct {
	state         protoimpl.MessageState        `protogen:"open.v1"`
	MemoComment   *ActivityMemoCommentPayload   `protobuf:"bytes,1,opt,name=memo_comment,json=memoComment,proto3" json:"memo_comment,omitempty"`
	VersionUpdate *ActivityVersionUpdatePayload `protobuf:"bytes,2,opt,name=version_update,json=versionUpdate,proto3" json:"version_update,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *ActivityPayload) Reset() {
	*x = ActivityPayload{}
	mi := &file_api_v1_activity_service_proto_msgTypes[1]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *ActivityPayload) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ActivityPayload) ProtoMessage() {}

func (x *ActivityPayload) ProtoReflect() protoreflect.Message {
	mi := &file_api_v1_activity_service_proto_msgTypes[1]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ActivityPayload.ProtoReflect.Descriptor instead.
func (*ActivityPayload) Descriptor() ([]byte, []int) {
	return file_api_v1_activity_service_proto_rawDescGZIP(), []int{1}
}

func (x *ActivityPayload) GetMemoComment() *ActivityMemoCommentPayload {
	if x != nil {
		return x.MemoComment
	}
	return nil
}

func (x *ActivityPayload) GetVersionUpdate() *ActivityVersionUpdatePayload {
	if x != nil {
		return x.VersionUpdate
	}
	return nil
}

// ActivityMemoCommentPayload represents the payload of a memo comment activity.
type ActivityMemoCommentPayload struct {
	state protoimpl.MessageState `protogen:"open.v1"`
	// The memo id of comment.
	MemoId int32 `protobuf:"varint,1,opt,name=memo_id,json=memoId,proto3" json:"memo_id,omitempty"`
	// The memo id of related memo.
	RelatedMemoId int32 `protobuf:"varint,2,opt,name=related_memo_id,json=relatedMemoId,proto3" json:"related_memo_id,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *ActivityMemoCommentPayload) Reset() {
	*x = ActivityMemoCommentPayload{}
	mi := &file_api_v1_activity_service_proto_msgTypes[2]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *ActivityMemoCommentPayload) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ActivityMemoCommentPayload) ProtoMessage() {}

func (x *ActivityMemoCommentPayload) ProtoReflect() protoreflect.Message {
	mi := &file_api_v1_activity_service_proto_msgTypes[2]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ActivityMemoCommentPayload.ProtoReflect.Descriptor instead.
func (*ActivityMemoCommentPayload) Descriptor() ([]byte, []int) {
	return file_api_v1_activity_service_proto_rawDescGZIP(), []int{2}
}

func (x *ActivityMemoCommentPayload) GetMemoId() int32 {
	if x != nil {
		return x.MemoId
	}
	return 0
}

func (x *ActivityMemoCommentPayload) GetRelatedMemoId() int32 {
	if x != nil {
		return x.RelatedMemoId
	}
	return 0
}

type ActivityVersionUpdatePayload struct {
	state protoimpl.MessageState `protogen:"open.v1"`
	// The updated version of memos.
	Version       string `protobuf:"bytes,1,opt,name=version,proto3" json:"version,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *ActivityVersionUpdatePayload) Reset() {
	*x = ActivityVersionUpdatePayload{}
	mi := &file_api_v1_activity_service_proto_msgTypes[3]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *ActivityVersionUpdatePayload) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ActivityVersionUpdatePayload) ProtoMessage() {}

func (x *ActivityVersionUpdatePayload) ProtoReflect() protoreflect.Message {
	mi := &file_api_v1_activity_service_proto_msgTypes[3]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ActivityVersionUpdatePayload.ProtoReflect.Descriptor instead.
func (*ActivityVersionUpdatePayload) Descriptor() ([]byte, []int) {
	return file_api_v1_activity_service_proto_rawDescGZIP(), []int{3}
}

func (x *ActivityVersionUpdatePayload) GetVersion() string {
	if x != nil {
		return x.Version
	}
	return ""
}

type GetActivityRequest struct {
	state protoimpl.MessageState `protogen:"open.v1"`
	// The name of the activity.
	// Format: activities/{id}
	Name          string `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *GetActivityRequest) Reset() {
	*x = GetActivityRequest{}
	mi := &file_api_v1_activity_service_proto_msgTypes[4]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *GetActivityRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetActivityRequest) ProtoMessage() {}

func (x *GetActivityRequest) ProtoReflect() protoreflect.Message {
	mi := &file_api_v1_activity_service_proto_msgTypes[4]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetActivityRequest.ProtoReflect.Descriptor instead.
func (*GetActivityRequest) Descriptor() ([]byte, []int) {
	return file_api_v1_activity_service_proto_rawDescGZIP(), []int{4}
}

func (x *GetActivityRequest) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

var File_api_v1_activity_service_proto protoreflect.FileDescriptor

var file_api_v1_activity_service_proto_rawDesc = string([]byte{
	0x0a, 0x1d, 0x61, 0x70, 0x69, 0x2f, 0x76, 0x31, 0x2f, 0x61, 0x63, 0x74, 0x69, 0x76, 0x69, 0x74,
	0x79, 0x5f, 0x73, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12,
	0x0c, 0x6d, 0x65, 0x6d, 0x6f, 0x73, 0x2e, 0x61, 0x70, 0x69, 0x2e, 0x76, 0x31, 0x1a, 0x1c, 0x67,
	0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2f, 0x61, 0x70, 0x69, 0x2f, 0x61, 0x6e, 0x6e, 0x6f, 0x74, 0x61,
	0x74, 0x69, 0x6f, 0x6e, 0x73, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x1a, 0x17, 0x67, 0x6f, 0x6f,
	0x67, 0x6c, 0x65, 0x2f, 0x61, 0x70, 0x69, 0x2f, 0x63, 0x6c, 0x69, 0x65, 0x6e, 0x74, 0x2e, 0x70,
	0x72, 0x6f, 0x74, 0x6f, 0x1a, 0x1f, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2f, 0x61, 0x70, 0x69,
	0x2f, 0x66, 0x69, 0x65, 0x6c, 0x64, 0x5f, 0x62, 0x65, 0x68, 0x61, 0x76, 0x69, 0x6f, 0x72, 0x2e,
	0x70, 0x72, 0x6f, 0x74, 0x6f, 0x1a, 0x1f, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2f, 0x70, 0x72,
	0x6f, 0x74, 0x6f, 0x62, 0x75, 0x66, 0x2f, 0x74, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61, 0x6d, 0x70,
	0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x22, 0xe3, 0x01, 0x0a, 0x08, 0x41, 0x63, 0x74, 0x69, 0x76,
	0x69, 0x74, 0x79, 0x12, 0x12, 0x0a, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x18, 0x01, 0x20, 0x01, 0x28,
	0x09, 0x52, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x12, 0x1d, 0x0a, 0x0a, 0x63, 0x72, 0x65, 0x61, 0x74,
	0x6f, 0x72, 0x5f, 0x69, 0x64, 0x18, 0x02, 0x20, 0x01, 0x28, 0x05, 0x52, 0x09, 0x63, 0x72, 0x65,
	0x61, 0x74, 0x6f, 0x72, 0x49, 0x64, 0x12, 0x12, 0x0a, 0x04, 0x74, 0x79, 0x70, 0x65, 0x18, 0x03,
	0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x74, 0x79, 0x70, 0x65, 0x12, 0x14, 0x0a, 0x05, 0x6c, 0x65,
	0x76, 0x65, 0x6c, 0x18, 0x04, 0x20, 0x01, 0x28, 0x09, 0x52, 0x05, 0x6c, 0x65, 0x76, 0x65, 0x6c,
	0x12, 0x41, 0x0a, 0x0b, 0x63, 0x72, 0x65, 0x61, 0x74, 0x65, 0x5f, 0x74, 0x69, 0x6d, 0x65, 0x18,
	0x05, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x1a, 0x2e, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2e, 0x70,
	0x72, 0x6f, 0x74, 0x6f, 0x62, 0x75, 0x66, 0x2e, 0x54, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61, 0x6d,
	0x70, 0x42, 0x04, 0xe2, 0x41, 0x01, 0x03, 0x52, 0x0a, 0x63, 0x72, 0x65, 0x61, 0x74, 0x65, 0x54,
	0x69, 0x6d, 0x65, 0x12, 0x37, 0x0a, 0x07, 0x70, 0x61, 0x79, 0x6c, 0x6f, 0x61, 0x64, 0x18, 0x06,
	0x20, 0x01, 0x28, 0x0b, 0x32, 0x1d, 0x2e, 0x6d, 0x65, 0x6d, 0x6f, 0x73, 0x2e, 0x61, 0x70, 0x69,
	0x2e, 0x76, 0x31, 0x2e, 0x41, 0x63, 0x74, 0x69, 0x76, 0x69, 0x74, 0x79, 0x50, 0x61, 0x79, 0x6c,
	0x6f, 0x61, 0x64, 0x52, 0x07, 0x70, 0x61, 0x79, 0x6c, 0x6f, 0x61, 0x64, 0x22, 0xb1, 0x01, 0x0a,
	0x0f, 0x41, 0x63, 0x74, 0x69, 0x76, 0x69, 0x74, 0x79, 0x50, 0x61, 0x79, 0x6c, 0x6f, 0x61, 0x64,
	0x12, 0x4b, 0x0a, 0x0c, 0x6d, 0x65, 0x6d, 0x6f, 0x5f, 0x63, 0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74,
	0x18, 0x01, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x28, 0x2e, 0x6d, 0x65, 0x6d, 0x6f, 0x73, 0x2e, 0x61,
	0x70, 0x69, 0x2e, 0x76, 0x31, 0x2e, 0x41, 0x63, 0x74, 0x69, 0x76, 0x69, 0x74, 0x79, 0x4d, 0x65,
	0x6d, 0x6f, 0x43, 0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74, 0x50, 0x61, 0x79, 0x6c, 0x6f, 0x61, 0x64,
	0x52, 0x0b, 0x6d, 0x65, 0x6d, 0x6f, 0x43, 0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74, 0x12, 0x51, 0x0a,
	0x0e, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x5f, 0x75, 0x70, 0x64, 0x61, 0x74, 0x65, 0x18,
	0x02, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x2a, 0x2e, 0x6d, 0x65, 0x6d, 0x6f, 0x73, 0x2e, 0x61, 0x70,
	0x69, 0x2e, 0x76, 0x31, 0x2e, 0x41, 0x63, 0x74, 0x69, 0x76, 0x69, 0x74, 0x79, 0x56, 0x65, 0x72,
	0x73, 0x69, 0x6f, 0x6e, 0x55, 0x70, 0x64, 0x61, 0x74, 0x65, 0x50, 0x61, 0x79, 0x6c, 0x6f, 0x61,
	0x64, 0x52, 0x0d, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x55, 0x70, 0x64, 0x61, 0x74, 0x65,
	0x22, 0x5d, 0x0a, 0x1a, 0x41, 0x63, 0x74, 0x69, 0x76, 0x69, 0x74, 0x79, 0x4d, 0x65, 0x6d, 0x6f,
	0x43, 0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74, 0x50, 0x61, 0x79, 0x6c, 0x6f, 0x61, 0x64, 0x12, 0x17,
	0x0a, 0x07, 0x6d, 0x65, 0x6d, 0x6f, 0x5f, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x05, 0x52,
	0x06, 0x6d, 0x65, 0x6d, 0x6f, 0x49, 0x64, 0x12, 0x26, 0x0a, 0x0f, 0x72, 0x65, 0x6c, 0x61, 0x74,
	0x65, 0x64, 0x5f, 0x6d, 0x65, 0x6d, 0x6f, 0x5f, 0x69, 0x64, 0x18, 0x02, 0x20, 0x01, 0x28, 0x05,
	0x52, 0x0d, 0x72, 0x65, 0x6c, 0x61, 0x74, 0x65, 0x64, 0x4d, 0x65, 0x6d, 0x6f, 0x49, 0x64, 0x22,
	0x38, 0x0a, 0x1c, 0x41, 0x63, 0x74, 0x69, 0x76, 0x69, 0x74, 0x79, 0x56, 0x65, 0x72, 0x73, 0x69,
	0x6f, 0x6e, 0x55, 0x70, 0x64, 0x61, 0x74, 0x65, 0x50, 0x61, 0x79, 0x6c, 0x6f, 0x61, 0x64, 0x12,
	0x18, 0x0a, 0x07, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09,
	0x52, 0x07, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x22, 0x28, 0x0a, 0x12, 0x47, 0x65, 0x74,
	0x41, 0x63, 0x74, 0x69, 0x76, 0x69, 0x74, 0x79, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12,
	0x12, 0x0a, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x6e,
	0x61, 0x6d, 0x65, 0x32, 0x86, 0x01, 0x0a, 0x0f, 0x41, 0x63, 0x74, 0x69, 0x76, 0x69, 0x74, 0x79,
	0x53, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x12, 0x73, 0x0a, 0x0b, 0x47, 0x65, 0x74, 0x41, 0x63,
	0x74, 0x69, 0x76, 0x69, 0x74, 0x79, 0x12, 0x20, 0x2e, 0x6d, 0x65, 0x6d, 0x6f, 0x73, 0x2e, 0x61,
	0x70, 0x69, 0x2e, 0x76, 0x31, 0x2e, 0x47, 0x65, 0x74, 0x41, 0x63, 0x74, 0x69, 0x76, 0x69, 0x74,
	0x79, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x16, 0x2e, 0x6d, 0x65, 0x6d, 0x6f, 0x73,
	0x2e, 0x61, 0x70, 0x69, 0x2e, 0x76, 0x31, 0x2e, 0x41, 0x63, 0x74, 0x69, 0x76, 0x69, 0x74, 0x79,
	0x22, 0x2a, 0xda, 0x41, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x82, 0xd3, 0xe4, 0x93, 0x02, 0x1d, 0x12,
	0x1b, 0x2f, 0x61, 0x70, 0x69, 0x2f, 0x76, 0x31, 0x2f, 0x7b, 0x6e, 0x61, 0x6d, 0x65, 0x3d, 0x61,
	0x63, 0x74, 0x69, 0x76, 0x69, 0x74, 0x69, 0x65, 0x73, 0x2f, 0x2a, 0x7d, 0x42, 0xac, 0x01, 0x0a,
	0x10, 0x63, 0x6f, 0x6d, 0x2e, 0x6d, 0x65, 0x6d, 0x6f, 0x73, 0x2e, 0x61, 0x70, 0x69, 0x2e, 0x76,
	0x31, 0x42, 0x14, 0x41, 0x63, 0x74, 0x69, 0x76, 0x69, 0x74, 0x79, 0x53, 0x65, 0x72, 0x76, 0x69,
	0x63, 0x65, 0x50, 0x72, 0x6f, 0x74, 0x6f, 0x50, 0x01, 0x5a, 0x30, 0x67, 0x69, 0x74, 0x68, 0x75,
	0x62, 0x2e, 0x63, 0x6f, 0x6d, 0x2f, 0x75, 0x73, 0x65, 0x6d, 0x65, 0x6d, 0x6f, 0x73, 0x2f, 0x6d,
	0x65, 0x6d, 0x6f, 0x73, 0x2f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2f, 0x67, 0x65, 0x6e, 0x2f, 0x61,
	0x70, 0x69, 0x2f, 0x76, 0x31, 0x3b, 0x61, 0x70, 0x69, 0x76, 0x31, 0xa2, 0x02, 0x03, 0x4d, 0x41,
	0x58, 0xaa, 0x02, 0x0c, 0x4d, 0x65, 0x6d, 0x6f, 0x73, 0x2e, 0x41, 0x70, 0x69, 0x2e, 0x56, 0x31,
	0xca, 0x02, 0x0c, 0x4d, 0x65, 0x6d, 0x6f, 0x73, 0x5c, 0x41, 0x70, 0x69, 0x5c, 0x56, 0x31, 0xe2,
	0x02, 0x18, 0x4d, 0x65, 0x6d, 0x6f, 0x73, 0x5c, 0x41, 0x70, 0x69, 0x5c, 0x56, 0x31, 0x5c, 0x47,
	0x50, 0x42, 0x4d, 0x65, 0x74, 0x61, 0x64, 0x61, 0x74, 0x61, 0xea, 0x02, 0x0e, 0x4d, 0x65, 0x6d,
	0x6f, 0x73, 0x3a, 0x3a, 0x41, 0x70, 0x69, 0x3a, 0x3a, 0x56, 0x31, 0x62, 0x06, 0x70, 0x72, 0x6f,
	0x74, 0x6f, 0x33,
})

var (
	file_api_v1_activity_service_proto_rawDescOnce sync.Once
	file_api_v1_activity_service_proto_rawDescData []byte
)

func file_api_v1_activity_service_proto_rawDescGZIP() []byte {
	file_api_v1_activity_service_proto_rawDescOnce.Do(func() {
		file_api_v1_activity_service_proto_rawDescData = protoimpl.X.CompressGZIP(unsafe.Slice(unsafe.StringData(file_api_v1_activity_service_proto_rawDesc), len(file_api_v1_activity_service_proto_rawDesc)))
	})
	return file_api_v1_activity_service_proto_rawDescData
}

var file_api_v1_activity_service_proto_msgTypes = make([]protoimpl.MessageInfo, 5)
var file_api_v1_activity_service_proto_goTypes = []any{
	(*Activity)(nil),                     // 0: memos.api.v1.Activity
	(*ActivityPayload)(nil),              // 1: memos.api.v1.ActivityPayload
	(*ActivityMemoCommentPayload)(nil),   // 2: memos.api.v1.ActivityMemoCommentPayload
	(*ActivityVersionUpdatePayload)(nil), // 3: memos.api.v1.ActivityVersionUpdatePayload
	(*GetActivityRequest)(nil),           // 4: memos.api.v1.GetActivityRequest
	(*timestamppb.Timestamp)(nil),        // 5: google.protobuf.Timestamp
}
var file_api_v1_activity_service_proto_depIdxs = []int32{
	5, // 0: memos.api.v1.Activity.create_time:type_name -> google.protobuf.Timestamp
	1, // 1: memos.api.v1.Activity.payload:type_name -> memos.api.v1.ActivityPayload
	2, // 2: memos.api.v1.ActivityPayload.memo_comment:type_name -> memos.api.v1.ActivityMemoCommentPayload
	3, // 3: memos.api.v1.ActivityPayload.version_update:type_name -> memos.api.v1.ActivityVersionUpdatePayload
	4, // 4: memos.api.v1.ActivityService.GetActivity:input_type -> memos.api.v1.GetActivityRequest
	0, // 5: memos.api.v1.ActivityService.GetActivity:output_type -> memos.api.v1.Activity
	5, // [5:6] is the sub-list for method output_type
	4, // [4:5] is the sub-list for method input_type
	4, // [4:4] is the sub-list for extension type_name
	4, // [4:4] is the sub-list for extension extendee
	0, // [0:4] is the sub-list for field type_name
}

func init() { file_api_v1_activity_service_proto_init() }
func file_api_v1_activity_service_proto_init() {
	if File_api_v1_activity_service_proto != nil {
		return
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: unsafe.Slice(unsafe.StringData(file_api_v1_activity_service_proto_rawDesc), len(file_api_v1_activity_service_proto_rawDesc)),
			NumEnums:      0,
			NumMessages:   5,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_api_v1_activity_service_proto_goTypes,
		DependencyIndexes: file_api_v1_activity_service_proto_depIdxs,
		MessageInfos:      file_api_v1_activity_service_proto_msgTypes,
	}.Build()
	File_api_v1_activity_service_proto = out.File
	file_api_v1_activity_service_proto_goTypes = nil
	file_api_v1_activity_service_proto_depIdxs = nil
}
