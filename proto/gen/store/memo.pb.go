// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.36.6
// 	protoc        (unknown)
// source: store/memo.proto

package store

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
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

type MemoPayload struct {
	state    protoimpl.MessageState `protogen:"open.v1"`
	Property *MemoPayload_Property  `protobuf:"bytes,1,opt,name=property,proto3" json:"property,omitempty"`
	Location *MemoPayload_Location  `protobuf:"bytes,2,opt,name=location,proto3" json:"location,omitempty"`
	Tags     []string               `protobuf:"bytes,3,rep,name=tags,proto3" json:"tags,omitempty"`
	// The references of the memo. Should be a list of uuid.
	References    []string `protobuf:"bytes,4,rep,name=references,proto3" json:"references,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *MemoPayload) Reset() {
	*x = MemoPayload{}
	mi := &file_store_memo_proto_msgTypes[0]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *MemoPayload) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*MemoPayload) ProtoMessage() {}

func (x *MemoPayload) ProtoReflect() protoreflect.Message {
	mi := &file_store_memo_proto_msgTypes[0]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use MemoPayload.ProtoReflect.Descriptor instead.
func (*MemoPayload) Descriptor() ([]byte, []int) {
	return file_store_memo_proto_rawDescGZIP(), []int{0}
}

func (x *MemoPayload) GetProperty() *MemoPayload_Property {
	if x != nil {
		return x.Property
	}
	return nil
}

func (x *MemoPayload) GetLocation() *MemoPayload_Location {
	if x != nil {
		return x.Location
	}
	return nil
}

func (x *MemoPayload) GetTags() []string {
	if x != nil {
		return x.Tags
	}
	return nil
}

func (x *MemoPayload) GetReferences() []string {
	if x != nil {
		return x.References
	}
	return nil
}

type MemoPayload_Property struct {
	state              protoimpl.MessageState `protogen:"open.v1"`
	HasLink            bool                   `protobuf:"varint,1,opt,name=has_link,json=hasLink,proto3" json:"has_link,omitempty"`
	HasTaskList        bool                   `protobuf:"varint,2,opt,name=has_task_list,json=hasTaskList,proto3" json:"has_task_list,omitempty"`
	HasCode            bool                   `protobuf:"varint,3,opt,name=has_code,json=hasCode,proto3" json:"has_code,omitempty"`
	HasIncompleteTasks bool                   `protobuf:"varint,4,opt,name=has_incomplete_tasks,json=hasIncompleteTasks,proto3" json:"has_incomplete_tasks,omitempty"`
	unknownFields      protoimpl.UnknownFields
	sizeCache          protoimpl.SizeCache
}

func (x *MemoPayload_Property) Reset() {
	*x = MemoPayload_Property{}
	mi := &file_store_memo_proto_msgTypes[1]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *MemoPayload_Property) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*MemoPayload_Property) ProtoMessage() {}

func (x *MemoPayload_Property) ProtoReflect() protoreflect.Message {
	mi := &file_store_memo_proto_msgTypes[1]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use MemoPayload_Property.ProtoReflect.Descriptor instead.
func (*MemoPayload_Property) Descriptor() ([]byte, []int) {
	return file_store_memo_proto_rawDescGZIP(), []int{0, 0}
}

func (x *MemoPayload_Property) GetHasLink() bool {
	if x != nil {
		return x.HasLink
	}
	return false
}

func (x *MemoPayload_Property) GetHasTaskList() bool {
	if x != nil {
		return x.HasTaskList
	}
	return false
}

func (x *MemoPayload_Property) GetHasCode() bool {
	if x != nil {
		return x.HasCode
	}
	return false
}

func (x *MemoPayload_Property) GetHasIncompleteTasks() bool {
	if x != nil {
		return x.HasIncompleteTasks
	}
	return false
}

type MemoPayload_Location struct {
	state         protoimpl.MessageState `protogen:"open.v1"`
	Placeholder   string                 `protobuf:"bytes,1,opt,name=placeholder,proto3" json:"placeholder,omitempty"`
	Latitude      float64                `protobuf:"fixed64,2,opt,name=latitude,proto3" json:"latitude,omitempty"`
	Longitude     float64                `protobuf:"fixed64,3,opt,name=longitude,proto3" json:"longitude,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *MemoPayload_Location) Reset() {
	*x = MemoPayload_Location{}
	mi := &file_store_memo_proto_msgTypes[2]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *MemoPayload_Location) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*MemoPayload_Location) ProtoMessage() {}

func (x *MemoPayload_Location) ProtoReflect() protoreflect.Message {
	mi := &file_store_memo_proto_msgTypes[2]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use MemoPayload_Location.ProtoReflect.Descriptor instead.
func (*MemoPayload_Location) Descriptor() ([]byte, []int) {
	return file_store_memo_proto_rawDescGZIP(), []int{0, 1}
}

func (x *MemoPayload_Location) GetPlaceholder() string {
	if x != nil {
		return x.Placeholder
	}
	return ""
}

func (x *MemoPayload_Location) GetLatitude() float64 {
	if x != nil {
		return x.Latitude
	}
	return 0
}

func (x *MemoPayload_Location) GetLongitude() float64 {
	if x != nil {
		return x.Longitude
	}
	return 0
}

var File_store_memo_proto protoreflect.FileDescriptor

const file_store_memo_proto_rawDesc = "" +
	"\n" +
	"\x10store/memo.proto\x12\vmemos.store\"\xc0\x03\n" +
	"\vMemoPayload\x12=\n" +
	"\bproperty\x18\x01 \x01(\v2!.memos.store.MemoPayload.PropertyR\bproperty\x12=\n" +
	"\blocation\x18\x02 \x01(\v2!.memos.store.MemoPayload.LocationR\blocation\x12\x12\n" +
	"\x04tags\x18\x03 \x03(\tR\x04tags\x12\x1e\n" +
	"\n" +
	"references\x18\x04 \x03(\tR\n" +
	"references\x1a\x96\x01\n" +
	"\bProperty\x12\x19\n" +
	"\bhas_link\x18\x01 \x01(\bR\ahasLink\x12\"\n" +
	"\rhas_task_list\x18\x02 \x01(\bR\vhasTaskList\x12\x19\n" +
	"\bhas_code\x18\x03 \x01(\bR\ahasCode\x120\n" +
	"\x14has_incomplete_tasks\x18\x04 \x01(\bR\x12hasIncompleteTasks\x1af\n" +
	"\bLocation\x12 \n" +
	"\vplaceholder\x18\x01 \x01(\tR\vplaceholder\x12\x1a\n" +
	"\blatitude\x18\x02 \x01(\x01R\blatitude\x12\x1c\n" +
	"\tlongitude\x18\x03 \x01(\x01R\tlongitudeB\x94\x01\n" +
	"\x0fcom.memos.storeB\tMemoProtoP\x01Z)github.com/usememos/memos/proto/gen/store\xa2\x02\x03MSX\xaa\x02\vMemos.Store\xca\x02\vMemos\\Store\xe2\x02\x17Memos\\Store\\GPBMetadata\xea\x02\fMemos::Storeb\x06proto3"

var (
	file_store_memo_proto_rawDescOnce sync.Once
	file_store_memo_proto_rawDescData []byte
)

func file_store_memo_proto_rawDescGZIP() []byte {
	file_store_memo_proto_rawDescOnce.Do(func() {
		file_store_memo_proto_rawDescData = protoimpl.X.CompressGZIP(unsafe.Slice(unsafe.StringData(file_store_memo_proto_rawDesc), len(file_store_memo_proto_rawDesc)))
	})
	return file_store_memo_proto_rawDescData
}

var file_store_memo_proto_msgTypes = make([]protoimpl.MessageInfo, 3)
var file_store_memo_proto_goTypes = []any{
	(*MemoPayload)(nil),          // 0: memos.store.MemoPayload
	(*MemoPayload_Property)(nil), // 1: memos.store.MemoPayload.Property
	(*MemoPayload_Location)(nil), // 2: memos.store.MemoPayload.Location
}
var file_store_memo_proto_depIdxs = []int32{
	1, // 0: memos.store.MemoPayload.property:type_name -> memos.store.MemoPayload.Property
	2, // 1: memos.store.MemoPayload.location:type_name -> memos.store.MemoPayload.Location
	2, // [2:2] is the sub-list for method output_type
	2, // [2:2] is the sub-list for method input_type
	2, // [2:2] is the sub-list for extension type_name
	2, // [2:2] is the sub-list for extension extendee
	0, // [0:2] is the sub-list for field type_name
}

func init() { file_store_memo_proto_init() }
func file_store_memo_proto_init() {
	if File_store_memo_proto != nil {
		return
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: unsafe.Slice(unsafe.StringData(file_store_memo_proto_rawDesc), len(file_store_memo_proto_rawDesc)),
			NumEnums:      0,
			NumMessages:   3,
			NumExtensions: 0,
			NumServices:   0,
		},
		GoTypes:           file_store_memo_proto_goTypes,
		DependencyIndexes: file_store_memo_proto_depIdxs,
		MessageInfos:      file_store_memo_proto_msgTypes,
	}.Build()
	File_store_memo_proto = out.File
	file_store_memo_proto_goTypes = nil
	file_store_memo_proto_depIdxs = nil
}
